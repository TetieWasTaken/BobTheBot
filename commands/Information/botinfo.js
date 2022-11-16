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
        inline: true,
      })
      .addFields({
        name: `Dependency versions`,
        value: `NodeJS: \`v18.12.0\`\nDiscord.JS: \`14.6.0\`\nMongoose: \`6.7.0\``,
        inline: true,
      })
      .addFields({
        name: `Links`,
        value:
          "[**Github**](https://github.com/UndefinedToast/Scorcher)\n[**Discord**](https://discord.com)",
        inline: true,
      })
      .setTimestamp();
    interaction.reply({
      embeds: [replyEmbed],
    });
  },
};
