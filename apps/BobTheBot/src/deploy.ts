import process from "node:process";
import { fileURLToPath, URL } from "node:url";
import { REST, Routes } from "discord.js";
import dotenv from "dotenv";
import readdirp from "readdirp";
import { capitalizeFirst, getCommandData, logger } from "./utils/index.js";

dotenv.config();

if (!process.env.BOT_TOKEN) {
  logger.error("No bot token provided.");
  process.exit(1);
}

const interactions = [];

for await (const file of readdirp(fileURLToPath(new URL("interactions", import.meta.url)), {
  fileFilter: ["*.js", "!index.js"],
})) {
  const commandName = `${capitalizeFirst(getCommandData(file.fullPath)?.name ?? "")}Command`;
  if (commandName.length <= 7) {
    logger.error(`No command name provided for ${file.fullPath}`);
    continue;
  }

  const test = await import(file.fullPath);

  if (!test[commandName]) {
    logger.error(`No command found for ${file.fullPath}`);
    continue;
  }

  interactions.push(test[commandName]);
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

  logger.info(`Successfully registered application commands.`);
})();
