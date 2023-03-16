import process from "node:process";
import { fileURLToPath, URL } from "node:url";
import { Partials, GatewayIntentBits, Options, ActivityType, type GuildMember, type RateLimitData } from "discord.js";
import dotenv from "dotenv";
import readdirp from "readdirp";
import Database from "./database.js";
import { logger, getCommandData, ExtendedClient } from "./utils/index.js";

dotenv.config();

if (!process.env.CLIENT_ID) {
  logger.error("No client id provided.");
  process.exit(1);
}

/**
 * Client for the bot with intents and partials
 */
const client: ExtendedClient = new ExtendedClient({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Message, Partials.Channel],
  makeCache: Options.cacheWithLimits({
    ...Options.DefaultMakeCacheSettings,
    MessageManager: 100,
    GuildMemberManager: {
      maxSize: 150,
      keepOverLimit: (member: GuildMember) => member.id === process.env.CLIENT_ID,
    },
    ReactionManager: 0,
  }),
  sweepers: {
    ...Options.DefaultSweeperSettings,
    messages: {
      interval: 3_600,
      lifetime: 1_800,
    },
  },
  presence: {
    activities: [{ name: `discord`, type: ActivityType.Watching }],
    status: "online",
  },
});

const db = new Database();

await db.connect(client).catch((error: Error) => {
  logger.error(`Error connecting to database: ${error.message}`);
});

try {
  for await (const dir of readdirp(fileURLToPath(new URL("interactions", import.meta.url)), {
    fileFilter: ["*.js"],
  })) {
    const command = await import(`${dir.fullPath}`);
    const commandData = getCommandData(dir.path);

    if (!commandData) {
      logger.warn({ name: dir.path }, "Unable to load command data, skipping...");
      continue;
    }

    logger.info({ name: dir.path }, `Loading command: ${commandData.name}`);
    client.interactions.set(commandData.name, command);
  }

  for await (const dir of readdirp(fileURLToPath(new URL("events", import.meta.url)), { fileFilter: "*.js" })) {
    const event = await import(`${dir.fullPath}`);
    const eventClass = new event.default();

    logger.info({ name: dir.path }, `Loading event: ${eventClass.name}`);

    if (eventClass.once) {
      client.once(eventClass.name, (...args: any[]) => eventClass.execute(...args, client));
    } else {
      client.on(eventClass.name, (...args: any[]) => eventClass.execute(...args, client));
    }
  }
} catch (_error) {
  const error = _error as Error;
  logger.error(error, error.message);
}

client.on("error", (error: Error) => {
  logger.error("The WebSocket encountered an error:", error);
});

client.rest.on("rateLimited", (info: RateLimitData) => {
  logger.warn(`Rate limited for ${info.timeToReset}ms on route ${info.route}`);
});

await client.login(process.env.BOT_TOKEN).catch((error: Error) => {
  logger.error(`Error logging in: ${error.message}`);
});
