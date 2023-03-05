import { EmbedBuilder, BaseInteraction } from "discord.js";
import { logger, raiseUserPermissionsError, raiseBotPermissionsError } from "../utils/index.js";
import type { ExtendedClient } from "../utils/index.js";
import { GuildModel } from "../models/index.js";
import { Color } from "../constants.js";

module.exports = {
  name: "interactionCreate",
  once: false,
  async execute(interaction: BaseInteraction, client: ExtendedClient) {
    if (interaction.isCommand()) {
      const command = client.interactions.get(interaction.commandName);

      if (!command || !interaction.inGuild()) return;

      const guildData = await GuildModel.findOne({
        GuildId: interaction.guild?.id,
      });

      if (guildData && guildData.DisabledCommands) {
        if (guildData.DisabledCommands.includes(interaction.commandName)) {
          const embed = new EmbedBuilder()
            .setColor(Color.DiscordDanger)
            .setTitle(":x: Command Disabled")
            .setDescription(`This command has been disabled by the server administrators.`)
            .setFooter({
              text: `Believe this is a mistake? Contact administrators to /enable this command`,
            });

          return interaction.reply({
            embeds: [embed],
            ephemeral: true,
          });
        }
      }

      if (command.cooldownTime) {
        const cooldownTime = command.cooldownTime;

        const currentTime = Date.now();
        if (client.cooldowns.has(interaction.commandName)) {
          const timeLeft = cooldownTime - (currentTime - client.cooldowns.get(interaction.commandName));
          if (timeLeft > 0) {
            return interaction.reply({
              content: `Please wait \`${timeLeft / 1000}\` seconds before using this command again.`,
              ephemeral: true,
            });
          }
        }

        client.cooldowns.set(`${interaction.commandName}`, currentTime);

        setTimeout(() => {
          client.cooldowns.delete(interaction.commandName);
        }, cooldownTime);
      }

      if (!interaction.inCachedGuild()) {
        return interaction.reply({
          content: "An unexpected error occured. Please try again later.\nREASON: Guild failed to cache.",
          ephemeral: true,
        });
      }

      if (command.requiredUserPerms?.key.length > 0) {
        for (const userPerm of command.requiredUserPerms.key) {
          if (!interaction.member?.permissions.has(userPerm)) {
            return raiseUserPermissionsError(interaction, userPerm);
          }
        }
      }

      if (command.requiredBotPerms?.key.length > 0) {
        for (const botPerm of command.requiredBotPerms.key) {
          if (!interaction.guild?.members.me?.permissions.has(botPerm)) {
            return raiseBotPermissionsError(interaction, botPerm);
          }
        }
      }

      try {
        const startTime = Date.now();
        await command.execute(interaction, client);
        logger.trace(
          {
            command: interaction.commandName,
            user: `${interaction.user.tag} (${interaction.user.id})`,
            time: `${Date.now() - startTime}ms`,
          },
          "Command executed"
        );
      } catch (err) {
        logger.warn(`Command ${interaction.commandName} failed to execute.\n\n${interaction}`);
        if (err) logger.error(err);
        await interaction.reply({
          content: "An error occured while executing that command.",
          ephemeral: true,
        });
      }
    } else if (interaction.isAutocomplete()) {
      const command = client.interactions.get(interaction.commandName);

      if (!command) {
        return logger.error(`No command matching ${interaction.commandName} was found.`);
      }

      try {
        await command.autocomplete(interaction);
      } catch (error) {
        logger.warn(`Autocomplete ${interaction.commandName} failed to execute.\n\n${interaction}`);
        return logger.error(error);
      }
    } else if (interaction.isButton()) {
      if (interaction.message.interaction?.user.id !== interaction.user.id)
        return interaction.reply({
          content: "This button is not for you!",
          ephemeral: true,
        });

      const button = client.buttons.get(interaction.customId);
      if (!button) return new Error("No code for button!");

      try {
        const startTime = Date.now();
        await button.execute(interaction);
        logger.trace(
          {
            id: interaction.customId,
            user: `${interaction.user.tag} (${interaction.user.id})`,
            time: `${Date.now() - startTime}ms`,
          },
          "Button executed"
        );
      } catch (err) {
        logger.warn(`Button ${interaction.customId} failed to execute.\n\n${interaction}`);
        logger.error(err);
      }
    } else {
      return logger.warn("Unknown interaction type");
    }
  },
};
