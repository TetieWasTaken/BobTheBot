require("dotenv").config();
const fs = require("fs");
const Database = require("./config/Database");
const { Partials, GatewayIntentBits } = require("discord.js");
const { table } = require("table");
const { logTimings } = require("./utils/logTimings");

let timerStart;

const { Client, Options, Collection } = require("discord.js");

const client = new Client({
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
    ...Options.defaultMakeCacheSettings,
    MessageManager: 100,
    GuildMemberManager: {
      maxSize: 150,
      keepOverLimit: (member: any) => member.id === client.user.id,
    },
    ReactionManager: 0,
  }),
  sweepers: {
    ...Options.DefaultSweeperSettings,
    messages: {
      interval: 3600,
      lifetime: 1800,
    },
  },
});

client.interactions = new Collection();
client.buttons = new Collection();
client.cooldowns = new Collection();
client.timings = new Collection();

const db = new Database();
db.connect(client);

timerStart = Date.now();

const commandFolders = fs.readdirSync("./src/interactions/").filter((item: any) => !/(^|\/)\.[^/.]/g.test(item));

console.log(`\n————————————————————————————————————————————————\n`);

let cnslTable = [["Command", "Status"]];

let config = {
  header: {
    alignment: "center",
    content: "Commands",
  },
};

for (const folder of commandFolders) {
  const commandFiles = fs.readdirSync(`./src/interactions/${folder}`);
  for (let file of commandFiles) {
    file = file.replace(".ts", ".js");
    if (!file.endsWith(".js")) {
      const subFiles = fs.readdirSync(`./src/interactions/${folder}/${file}`);
      for (const subFile of subFiles) {
        try {
          const command = require(`./interactions/${folder}/${file}/${subFile}`);
          client.interactions.set(command.data.name, command);
          cnslTable.push([`/${command.data.name}`, "✅"]);
        } catch (error) {
          console.log(error);
          cnslTable.push([`${file}`, "❌"]);
        }
      }
      continue;
    }

    try {
      const command = require(`./interactions/${folder}/${file}`);
      client.interactions.set(command.data.name, command);
      cnslTable.push([`/${command.data.name}`, "✅"]);
    } catch (error) {
      console.log(error);
      cnslTable.push([`${file}`, "❌"]);
    }
  }
}

console.log(table(cnslTable, config));

client.timings.set("Commands", Date.now() - timerStart);

console.log(`————————————————————————————————————————————————\n`);

cnslTable = [["Component", "Status"]];

config = {
  header: {
    alignment: "center",
    content: "Components",
  },
};

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
          cnslTable.push([`${button.data.name}`, "✅"]);
        } catch (error) {
          console.log(error);
          cnslTable.push([`${file}`, "❌"]);
        }
      }
      break;
    default:
      break;
  }
}

console.log(table(cnslTable, config));

client.timings.set("Components", Date.now() - timerStart);

console.log(`————————————————————————————————————————————————\n`);

cnslTable = [["Event", "Status"]];
config = {
  header: {
    alignment: "center",
    content: "Events",
  },
};

timerStart = Date.now();

const eventFiles = fs.readdirSync("./src/events").filter((file: any) => file.endsWith(".js") || file.endsWith(".ts"));

for (let file of eventFiles) {
  file = file.replace(".ts", ".js");
  try {
    const event = require(`./events/${file}`);

    if (event.once) {
      client.once(event.name, (...args: any) => event.execute(...args));
    } else {
      client.on(event.name, (...args: any) => event.execute(...args));
    }
    cnslTable.push([`${event.name}`, "✅"]);
  } catch (error) {
    console.log(error);
    cnslTable.push([`${file}`, "❌"]);
  }
}

console.log(table(cnslTable, config));

client.timings.set("Events", Date.now() - timerStart);

console.log(`————————————————————————————————————————————————\n`);

if (client.timings.size === 4) {
  logTimings(client.timings);
}

client.on("error", (error: any) => {
  console.error("The WebSocket encountered an error:", error);
});

client.rest.on("rateLimited", console.log);

client.login(process.env.BOT_TOKEN);
