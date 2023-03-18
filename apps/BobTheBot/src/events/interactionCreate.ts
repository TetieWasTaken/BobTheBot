import { setTimeout } from "node:timers/promises";
import { EmbedBuilder, type BaseInteraction } from "discord.js";
import { Color } from "../constants.js";
import { GuildModel } from "../models/index.js";
import {
  logger,
  raiseUserPermissionsError,
  raiseBotPermissionsError,
  type ExtendedClient,
  type Event,
} from "../utils/index.js";

/**
 * Logs the interaction error to the console
 *
 * @param interaction - The interaction that failed
 * @example
 * ```
 * logInteractionError(interaction);
 * ```
 */
function logInteractionError(interaction: BaseInteraction) {
  logger.trace({
    interaction: {
      id: interaction.id,
      guild: interaction.guild?.id,
      channel: interaction.channel?.id,
      user: interaction.user.id,
    },
  });
}

export default class implements Event {
  public name = "interactionCreate";

  public once = false;

  private commandName: string = "";

  public async execute(interaction: BaseInteraction, client: ExtendedClient) {
    if (interaction.isCommand()) {
      this.commandName = interaction.commandName;

      if (interaction.isContextMenuCommand())
        this.commandName = interaction.commandName
          .replaceAll(/^\w|[A-Z]|\b\w/g, (word, _index) => {
            return _index === 0 ? word.toLowerCase() : word.toUpperCase();
          })
          .replaceAll(/\s+/g, "");

      const command = client.interactions.get(this.commandName);

      if (!command) {
        logger.error(`Command ${this.commandName} not found.`);
        logInteractionError(interaction);
        return;
      }

      if (!interaction.channel?.isDMBased()) {
        if (!interaction.inCachedGuild()) {
          logger.error("Guild failed to cache");
          logInteractionError(interaction);

          await interaction.reply({
            content: "An unexpected error occured. Please try again later.\nREASON: Guild failed to cache.",
            ephemeral: true,
          });
          return;
        }

        const guildData = await GuildModel.findOne({
          GuildId: interaction.guild?.id,
        });

        if (guildData?.DisabledCommands && guildData.DisabledCommands.includes(this.commandName)) {
          const embed = new EmbedBuilder()
            .setColor(Color.DiscordDanger)
            .setTitle("❌ Command Disabled")
            .setDescription(`This command has been disabled by the server administrators.`)
            .setFooter({
              text: `Believe this is a mistake? Contact administrators to /enable this command`,
            });

          await interaction.reply({
            embeds: [embed],
            ephemeral: true,
          });
          return;
        }

        if (command.requiredUserPerms?.key.length > 0) {
          for (const userPerm of command.requiredUserPerms.key) {
            if (!interaction.member?.permissions.has(userPerm)) {
              await raiseUserPermissionsError(interaction, userPerm);
              return;
            }
          }
        }

        if (command.requiredBotPerms?.key.length > 0) {
          for (const botPerm of command.requiredBotPerms.key) {
            if (!interaction.guild?.members.me?.permissions.has(botPerm)) {
              await raiseBotPermissionsError(interaction, botPerm);
              return;
            }
          }
        }
      }

      if (command.cooldownTime) {
        const cooldownTime = command.cooldownTime;

        const currentTime = Date.now();
        if (client.cooldowns.has(this.commandName)) {
          const timeLeft = cooldownTime - (currentTime - client.cooldowns.get(this.commandName));
          if (timeLeft > 0) {
            await interaction.reply({
              content: `Please wait \`${timeLeft / 1_000}\` seconds before using this command again.`,
              ephemeral: true,
            });
            return;
          }
        }

        client.cooldowns.set(`${this.commandName}`, currentTime);

        await setTimeout(cooldownTime, () => {
          client.cooldowns.delete(this.commandName);
        }).catch((error) => {
          logger.error(error);
        });
      }

      try {
        const startTime = Date.now();
        await command.execute(interaction, client);
        if (Date.now() - startTime < 2_000) {
          logger.trace(
            {
              command: this.commandName,
              user: `${interaction.user.tag} (${interaction.user.id})`,
              time: `${Date.now() - startTime}ms`,
            },
            "Command executed"
          );
        } else {
          logger.warn(
            {
              command: this.commandName,
              user: `${interaction.user.tag} (${interaction.user.id})`,
              time: `${Date.now() - startTime}ms`,
            },
            "Command executed"
          );
        }
      } catch (error) {
        logger.warn(`Command ${this.commandName} failed to execute.`);
        logInteractionError(interaction);
        if (error) logger.error(error);
        await interaction.reply({
          content: "An error occured while executing that command.",
          ephemeral: true,
        });
      }
    } else if (interaction.isAutocomplete()) {
      const command = client.interactions.get(this.commandName);

      if (!command) {
        logger.error(`No command matching ${this.commandName} was found.`);
        return;
      }

      if (!interaction.inCachedGuild() && !interaction.channel?.isDMBased()) {
        logger.error("Guild failed to cache");
        return;
      }

      try {
        await command.autocomplete(interaction);
      } catch (error) {
        logger.warn(`Autocomplete ${this.commandName} failed to execute.`);
        logInteractionError(interaction);
        logger.error(error);
      }
    } else if (interaction.isButton()) {
      if (interaction.message.interaction?.user.id !== interaction.user.id) {
        await interaction.reply({
          content: "This button is not for you!",
          ephemeral: true,
        });
        return;
      }

      if (!interaction.inCachedGuild() && !interaction.channel?.isDMBased()) {
        logger.error("Guild failed to cache");
        return;
      }

      const button = client.buttons.get(interaction.customId);
      if (!button) {
        logger.error(`Button ${interaction.customId} not found.`);
        logInteractionError(interaction);
        return;
      }

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
      } catch (error) {
        logger.warn(`Button ${interaction.customId} failed to execute.`);
        logInteractionError(interaction);
        logger.error(error);
      }
    } else {
      logger.warn("Unknown interaction type");
    }
  }
}
