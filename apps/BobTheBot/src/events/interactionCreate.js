const GuildSchema = require("../models/GuildModel");
const { EmbedBuilder } = require("discord.js");
const { raiseUserPermissionsError, raiseBotPermissionsError } = require("../utils/returnError.js");

module.exports = {
  name: "interactionCreate",
  once: false,
  async execute(interaction) {
    if (interaction.isCommand()) {
      const client = interaction.client;

      const command = client.interactions.get(interaction.commandName);

      if (!command) return;

      const guildData = await GuildSchema.findOne({
        GuildId: interaction.guild.id,
      });

      if (guildData && guildData.DisabledCommands) {
        if (guildData.DisabledCommands.includes(interaction.commandName)) {
          const embed = new EmbedBuilder()
            .setColor(0xed4245)
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

      if (command.requiredUserPerms?.key.length > 0) {
        for (const userPerm of command.requiredUserPerms.key) {
          if (!interaction.member.permissions.has(userPerm)) {
            return raiseUserPermissionsError(interaction, userPerm);
          }
        }
      }

      if (command.requiredBotPerms?.key.length > 0) {
        for (const botPerm of command.requiredBotPerms.key) {
          if (!interaction.guild.members.me.permissions.has(botPerm)) {
            return raiseBotPermissionsError(interaction, botPerm);
          }
        }
      }

      try {
        console.time(`Command ${interaction.commandName} executed in`);
        await command.execute(interaction);
        console.timeEnd(`Command ${interaction.commandName} executed in`);
      } catch (err) {
        console.log(`Command ${interaction.commandName} failed to execute.\n\n${interaction}`);
        if (err) console.error(err);
        await interaction.reply({
          content: "An error occured while executing that command.",
          ephemeral: true,
        });
      }
    } else if (interaction.isAutocomplete()) {
      const command = interaction.client.interactions.get(interaction.commandName);

      if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
      }

      try {
        await command.autocomplete(interaction);
      } catch (error) {
        console.log(`Autocomplete ${interaction.commandName} failed to execute.\n\n${interaction}`);
        console.error(error);
      }
    } else if (interaction.isButton()) {
      if (interaction.message.interaction.user.id !== interaction.user.id)
        return interaction.reply({
          content: "This button is not for you!",
          ephemeral: true,
        });

      const button = interaction.client.buttons.get(interaction.customId);
      if (!button) return new Error("No code for button!");

      try {
        await button.execute(interaction);
      } catch (err) {
        console.log(`Button ${interaction.customId} failed to execute.\n\n${interaction}`);
        console.log(err);
      }
    }

    if (interaction.isModalSubmit()) {
      if (interaction.customId === "full-setup-modal") {
        const logChannelId = interaction.fields.getTextInputValue("logChannelIdInput");

        const replyEmbed = new EmbedBuilder()
          .setColor(0xffffff)
          .setTitle(`Setup completed`)
          .addFields(
            {
              name: `Guild ID`,
              value: `${interaction.guild.id}`,
              inline: true,
            },
            {
              name: `Logging channel`,
              value: `<#${logChannelId}>`,
              inline: true,
            }
          )
          .setFooter({
            text: "Incorrect information? Re-run the setup command.",
          });

        await interaction.reply({ embeds: [replyEmbed], ephemeral: true });

        await GuildSchema.findOneAndUpdate(
          {
            GuildId: interaction.guild.id,
          },
          {
            GuildLogChannel: logChannelId,
          }
        );
      }
    }
  },
};