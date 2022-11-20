const GuildSchema = require("../models/GuildModel");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "interactionCreate",
  once: false,
  async execute(interaction) {
    if (interaction.isButton()) {
      console.log("isButton interaction");
      const button = interaction.client.buttons.get(interaction.customId);
      console.log(button);
      if (!button) return new Error("No code for button!");

      try {
        console.log("trying button...");
        await button.execute(interaction);
      } catch (err) {
        console.log(err);
      }
    }

    if (interaction.isModalSubmit()) {
      if (interaction.customId === "full-setup-modal") {
        const logChannelId =
          interaction.fields.getTextInputValue("logChannelIdInput");

        const replyEmbed = new EmbedBuilder()
          .setColor(0xffbd67)
          .setTitle(`Setup completed`)
          .addFields({
            name: `Guild ID`,
            value: `${interaction.guild.id}`,
            inline: true,
          })
          .addFields({
            name: `Logging channel`,
            value: `<#${logChannelId}>`,
            inline: true,
          })
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

    if (!interaction.isCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (err) {
      if (err) console.error(err);
      await interaction.reply({
        content: "An error occured while executing that command.",
        ephemeral: true,
      });
    }
  },
};
