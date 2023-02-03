require("dotenv").config();
const fs = require("fs");
const Database = require("./config/Database");
const { Partials, GatewayIntentBits } = require("discord.js");
const GiveawayModel = require("./models/GiveawayModel");
const { table } = require("table");
const { logTimings } = require("./functions/logTimings");

let timerStart;

const { Client, Collection } = require("discord.js");
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildBans,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

client.commands = new Collection();
client.buttons = new Collection();
client.cooldowns = new Collection();
client.timings = new Collection();

const db = new Database();
db.connect(client);

timerStart = Date.now();

const { GiveawaysManager } = require("discord-giveaways");
const GiveawayManagerWithOwnDatabase = class extends GiveawaysManager {
  async getAllGiveaways() {
    return await GiveawayModel.find().lean().exec();
  }

  async saveGiveaway(messageId, giveawayData) {
    await GiveawayModel.create(giveawayData);
    return true;
  }

  async editGiveaway(messageId, giveawayData) {
    await GiveawayModel.updateOne({ messageId }, giveawayData).exec();
    return true;
  }

  async deleteGiveaway(messageId) {
    await GiveawayModel.deleteOne({ messageId }).exec();
    return true;
  }
};
const manager = new GiveawayManagerWithOwnDatabase(client, {
  default: {
    botsCanWin: false,
    embedColor: "#FF0000",
    embedColorEnd: "#000000",
    reaction: "🎉",
  },
});
client.giveawaysManager = manager;

client.timings.set("Giveaways", Date.now() - timerStart);
timerStart = Date.now();

const commandFolders = fs
  .readdirSync("./commands/")
  .filter((item) => !/(^|\/)\.[^/.]/g.test(item));
const commands = [];

console.log(`\n————————————————————————————————————————————————\n`);

let cnslTable = [["Command", "Status"]];

let config = {
  header: {
    alignment: "center",
    content: "Commands",
  },
};

for (const folder of commandFolders) {
  const commandFiles = fs
    .readdirSync(`./commands/${folder}`)
    .filter((file) => file.endsWith(".js"));
  for (const file of commandFiles) {
    try {
      const command = require(`./commands/${folder}/${file}`);
      commands.push(command.data.toJSON());
      client.commands.set(command.data.name, command);
      cnslTable.push([`/${command.data.name}`, "✅"]);
    } catch (error) {
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

const componentFolders = fs.readdirSync(`./components`);
for (const compfolder of componentFolders) {
  const componentFiles = fs
    .readdirSync(`./components/${compfolder}`)
    .filter((file) => file.endsWith(".js"));

  switch (compfolder) {
    case "buttons":
      for (const file of componentFiles) {
        try {
          const button = require(`./components/${compfolder}/${file}`);
          client.buttons.set(button.data.name, button);
          cnslTable.push([`${button.data.name}`, "✅"]);
        } catch (error) {
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

const eventFiles = fs
  .readdirSync("./events")
  .filter((file) => file.endsWith(".js"));

for (const file of eventFiles) {
  try {
    const event = require(`./events/${file}`);

    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args, commands));
    } else {
      client.on(event.name, (...args) => event.execute(...args, commands));
    }
    cnslTable.push([`${event.name}`, "✅"]);
  } catch (error) {
    cnslTable.push([`${file}`, "❌"]);
  }
}

console.log(table(cnslTable, config));

client.timings.set("Events", Date.now() - timerStart);

console.log(`————————————————————————————————————————————————\n`);

if (client.timings.size === 6) {
  logTimings(client.timings);
}

client.on("error", (error) => {
  console.error("The WebSocket encountered an error:", error);
});

client.rest.on("rateLimited", console.log);

client.login(process.env.BOT_TOKEN);
