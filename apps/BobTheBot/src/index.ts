import fs from "node:fs";
import process from "node:process";
import { Partials, GatewayIntentBits, Options, ActivityType, type GuildMember, type RateLimitData } from "discord.js";
import dotenv from "dotenv";
import Database from "./database.js";
import { logger, ExtendedClient } from "./utils/index.js";

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
    GatewayIntentBits.GuildBans, // Temporarily changed to GuildBans, since Dapi v0.37.20 doesn't support GuildModeration
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

// eslint-disable-next-line promise/prefer-await-to-callbacks
db.connect(client).catch((error: Error) => {
  logger.error(`Error connecting to database: ${error.message}`);
});

/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires */

let timerStart = Date.now();

const commandFolders = fs.readdirSync("./src/interactions/").filter((item: string) => !/(?:^|\/)\.[^./]/g.test(item));

let counter = 0;

for (const folder of commandFolders) {
  const commandFiles = fs.readdirSync(`./src/interactions/${folder}`);
  for (let file of commandFiles) {
    file = file.replace(".ts", ".js");
    if (!file.endsWith(".js")) {
      const subFiles = fs.readdirSync(`./src/interactions/${folder}/${file}`);
      for (const subFile of subFiles) {
        try {
          const command = require(`./interactions/${folder}/${file}/${subFile.replace(".ts", ".js")}`);
          client.interactions.set(command.data.name, command);
          counter++;
        } catch (error) {
          logger.error(`Error loading command ${subFile}: ${error}`);
        }
      }

      continue;
    }

    try {
      const command = require(`./interactions/${folder}/${file}`);
      client.interactions.set(command.data.name, command);
      counter++;
    } catch (error) {
      logger.error(`Error loading command ${file}: ${error}`);
    }
  }
}

logger.info(`Loaded ${counter} interactions in ${Date.now() - timerStart}ms`);

counter = 0;
timerStart = Date.now();

const componentFolders = fs.readdirSync(`./src/components`);
for (const compfolder of componentFolders) {
  const componentFiles = fs
    .readdirSync(`./src/components/${compfolder}`)
    .filter((file: string) => file.endsWith(".js") || file.endsWith(".ts"));

  switch (compfolder) {
    case "buttons":
      for (let file of componentFiles) {
        file = file.replace(".ts", ".js");
        try {
          const button = require(`./components/${compfolder}/${file}`);
          client.buttons.set(button.data.name, button);
          counter++;
        } catch (error) {
          logger.error(`Error loading button ${file}: ${error}`);
        }
      }

      break;
    default:
      break;
  }
}

logger.info(`Loaded ${counter} components in ${Date.now() - timerStart}ms`);

counter = 0;
timerStart = Date.now();

const eventFiles = fs
  .readdirSync("./src/events")
  .filter((file: string) => file.endsWith(".js") || file.endsWith(".ts"));

for (let file of eventFiles) {
  file = file.replace(".ts", ".js");
  try {
    const event = require(`./events/${file}`);

    if (event.once) {
      client.once(event.name, (...args: any[]) => event.execute(...args, client));
    } else {
      client.on(event.name, (...args: any[]) => event.execute(...args, client));
    }

    counter++;
  } catch (error) {
    logger.error(`Error loading event ${file}: ${error}`);
  }
}

logger.info(`Loaded ${counter} events in ${Date.now() - timerStart}ms`);

client.on("error", (error: Error) => {
  logger.error("The WebSocket encountered an error:", error);
});

client.rest.on("rateLimited", (info: RateLimitData) => {
  logger.warn(`Rate limited for ${info.timeToReset}ms on route ${info.route}`);
});

// eslint-disable-next-line promise/prefer-await-to-callbacks
client.login(process.env.BOT_TOKEN).catch((error: Error) => {
  logger.error(`Error logging in: ${error.message}`);
});
