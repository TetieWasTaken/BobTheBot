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

for await (const dir of readdirp(fileURLToPath(new URL("interactions", import.meta.url)), {
  fileFilter: ["*.js"],
})) {
  const commandName = `${capitalizeFirst(getCommandData(dir.fullPath)?.name.replaceAll(/\d/g, "") ?? "")}Command`;
  if (commandName.length <= 7) {
    logger.error(`No command name provided for ${dir.fullPath}`);
    continue;
  }

  const command = await import(dir.fullPath);

  if (!command[commandName]) {
    logger.error(`No command found for ${dir.fullPath}`);
    continue;
  }

  logger.info({ name: dir.path }, `Registering command: ${command[commandName].name}`);

  interactions.push(command[commandName]);
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

  logger.info(`Successfully registered application commands`);
})();
