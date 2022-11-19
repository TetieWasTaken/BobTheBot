//https://ziad87.net/intents/, https://discord.com/developers/applications/1036359071508484237/information
require("dotenv").config();
const fs = require("fs");
const Database = require("./config/Database");

const db = new Database();
db.connect();

const { Client, Collection } = require("discord.js");
const client = new Client({ intents: 33349 });

const commandFolders = fs
  .readdirSync("./commands/")
  .filter((item) => !/(^|\/)\.[^/.]/g.test(item));
const commands = [];

client.commands = new Collection();
client.buttons = new Collection();

for (const folder of commandFolders) {
  const commandFiles = fs
    .readdirSync(`./commands/${folder}`)
    .filter((file) => file.endsWith(".js"));
  for (const file of commandFiles) {
    const command = require(`./commands/${folder}/${file}`);
    commands.push(command.data.toJSON());
    client.commands.set(command.data.name, command);
  }
}

const componentFolders = fs.readdirSync(`./components`);
for (const compfolder of componentFolders) {
  const componentFiles = fs
    .readdirSync(`./components/${compfolder}`)
    .filter((file) => file.endsWith(".js"));

  switch (compfolder) {
    case "buttons":
      for (const file of componentFiles) {
        const button = require(`./components/${compfolder}/${file}`);
        client.buttons.set(button.data.name, button);
      }
      break;
    default:
      break;
  }
}

const eventFiles = fs
  .readdirSync("./events")
  .filter((file) => file.endsWith(".js"));

for (const file of eventFiles) {
  const event = require(`./events/${file}`);

  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, commands));
  } else {
    client.on(event.name, (...args) => event.execute(...args, commands));
  }
}

client.on("error", (error) => {
  console.error("The WebSocket encountered an error:", error);
});

client.login(process.env.BOT_TOKEN);
