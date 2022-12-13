require("dotenv").config();
const fs = require("fs");
const Database = require("./config/Database");
const { Partials, GatewayIntentBits } = require("discord.js");
const GiveawayModel = require("./models/GiveawayModel");
const { Player } = require("discord-player");

const db = new Database();
db.connect();

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

const commandFolders = fs
  .readdirSync("./commands/")
  .filter((item) => !/(^|\/)\.[^/.]/g.test(item));
const commands = [];

client.commands = new Collection();
client.buttons = new Collection();

console.log(`------------------------------------------------`);

for (const folder of commandFolders) {
  console.log(`Loading commands from ${folder}`);
  const commandFiles = fs
    .readdirSync(`./commands/${folder}`)
    .filter((file) => file.endsWith(".js"));
  for (const file of commandFiles) {
    const command = require(`./commands/${folder}/${file}`);
    commands.push(command.data.toJSON());
    client.commands.set(command.data.name, command);
    console.log(`| ✅ ${file} loaded!`);
  }
}

console.log(`------------------------------------------------`);

const componentFolders = fs.readdirSync(`./components`);
for (const compfolder of componentFolders) {
  const componentFiles = fs
    .readdirSync(`./components/${compfolder}`)
    .filter((file) => file.endsWith(".js"));

  switch (compfolder) {
    case "buttons":
      console.log(`Loading buttons from ${compfolder}`);
      for (const file of componentFiles) {
        const button = require(`./components/${compfolder}/${file}`);
        client.buttons.set(button.data.name, button);
        console.log(`| ✅ ${file} loaded!`);
      }
      break;
    default:
      break;
  }
}

console.log(`------------------------------------------------`);

const eventFiles = fs
  .readdirSync("./events")
  .filter((file) => file.endsWith(".js"));

console.log(`Loading events`);

for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  console.log(`| ✅ ${file} loaded!`);

  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, commands));
  } else {
    client.on(event.name, (...args) => event.execute(...args, commands));
  }
}

console.log(`------------------------------------------------`);

client.player = new Player(client, {
  ytdlOptions: {
    quality: "highestaudio",
    highWaterMark: 1 << 25,
  },
});

client.on("error", (error) => {
  console.error("The WebSocket encountered an error:", error);
});

client.rest.on("rateLimited", console.log);

client.login(process.env.BOT_TOKEN);
