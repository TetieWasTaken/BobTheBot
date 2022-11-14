const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("botinfo")
    .setDescription("Receive information about the bot"),
  async execute(interaction) {
    const developerArray = ["Tetie#4242"];
    const replyEmbed = new EmbedBuilder()
      .addFields({
        name: `Name`,
        value: `
                    Scorcher`,
        inline: true,
      })
      .addFields({
        name: `ID`,
        value: `
                    1036359071508484237`,
        inline: true,
      })
      .addFields({
        name: `Developers`,
        value: `
                    ${developerArray.join(", ") || "None"}`,
        inline: false,
      })
      .setTimestamp();
    interaction.reply({
      embeds: [replyEmbed],
    });
  },
};
