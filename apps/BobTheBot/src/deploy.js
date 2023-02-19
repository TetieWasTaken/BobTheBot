require("dotenv").config();
const { REST, Routes } = require("discord.js");
const fs = require("fs");
const { table } = require("table");

const commandFolders = fs.readdirSync("./src/interactions/").filter((item) => !/(^|\/)\.[^/.]/g.test(item));
const interactions = [];

for (const folder of commandFolders) {
  const commandFiles = fs.readdirSync(`./src/interactions/${folder}`);
  for (const file of commandFiles) {
    if (!file.endsWith(".js")) {
      const subFiles = fs.readdirSync(`./src/interactions/${folder}/${file}`);
      for (const subFile of subFiles) {
        try {
          const command = require(`./interactions/${folder}/${file}/${subFile}`);
          interactions.push(command.data.toJSON());
        } catch (error) {
          console.log(error);
        }
      }
      continue;
    }

    try {
      const command = require(`./interactions/${folder}/${file}`);
      interactions.push(command.data.toJSON());
    } catch (error) {
      console.log(error);
    }
  }
}

const rest = new REST({
  version: "10",
}).setToken(process.env.BOT_TOKEN);

(async () => {
  try {
    if (process.env.ENV === "production") {
      await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: interactions });
    } else {
      await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), {
        body: interactions,
      });
    }
  } catch (error) {
    console.error(error);
  }

  const registerConfig = {
    header: {
      alignment: "center",
      content: `Commands registered`,
    },
    columnDefault: {
      width: 20,
    },
  };

  const registerTable = [
    ["Commands", `${interactions.length}`],
    ["Scope", `${process.env.ENV === "production" ? "Global" : "Guild"}`],
  ];

  console.log(table(registerTable, registerConfig));
})();
