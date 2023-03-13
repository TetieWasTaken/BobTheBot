import process from "node:process";
import { REST, Routes } from "discord.js";
import dotenv from "dotenv";
import { TestCommand } from "./interactions/index.js";
import { logger } from "./utils/index.js";

dotenv.config();

if (!process.env.BOT_TOKEN) {
  logger.error("No bot token provided.");
  process.exit(1);
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
      await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: [TestCommand] });
    } else {
      if (!process.env.GUILD_ID) {
        logger.error("No guild id provided.");
        process.exit(1);
      }

      await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), {
        body: [TestCommand],
      });
    }
  } catch (error) {
    logger.error(error);
  }

  logger.info(`Successfully registered application commands.`);
})();
