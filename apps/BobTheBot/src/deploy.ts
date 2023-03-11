import fs from "node:fs";
import process from "node:process";
import { REST, Routes } from "discord.js";
import dotenv from "dotenv";
import { logger } from "./utils/index.js";

dotenv.config();

if (!process.env.BOT_TOKEN) {
  logger.error("No bot token provided.");
  process.exit(1);
}

const commandFolders = fs.readdirSync("./src/interactions/").filter((item: string) => !/(?:^|\/)\.[^./]/g.test(item));
const interactions = [];

/* eslint-disable @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports */

for (const folder of commandFolders) {
  const commandFiles = fs.readdirSync(`./src/interactions/${folder}`);
  for (const file of commandFiles) {
    if (!file.endsWith(".js") && !file.endsWith(".ts")) {
      const subFiles = fs.readdirSync(`./src/interactions/${folder}/${file}`);
      for (const subFile of subFiles) {
        try {
          const command = require(`./interactions/${folder}/${file}/${subFile.replace(".ts", ".js")}`);
          interactions.push(command.data.toJSON());
        } catch (error) {
          logger.error(error);
        }
      }

      continue;
    }

    try {
      const command = require(`./interactions/${folder}/${file.replace(".ts", ".js")}`);
      interactions.push(command.data.toJSON());
    } catch (error) {
      logger.error(error);
    }
  }
}

const rest = new REST({
  version: "10",
}).setToken(process.env.BOT_TOKEN);

(async () => {
  try {
    if (!process.env.CLIENT_ID) {
      logger.error("No client id provided.");
      process.exit(1);
    }

    if (process.env.ENV === "production") {
      await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: interactions });
    } else {
      if (!process.env.GUILD_ID) {
        logger.error("No guild id provided.");
        process.exit(1);
      }

      await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), {
        body: interactions,
      });
    }
  } catch (error) {
    logger.error(error);
  }

  logger.info(`Successfully registered ${interactions.length} application commands.`);
})();
