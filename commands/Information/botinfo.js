const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits } = require("discord.js");
const { EmbedBuilder } = require("discord.js");
const { roleColor } = require("../../functions/roleColor.js");

const requiredPerms = {
  type: "flags",
  key: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks],
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("botinfo")
    .setDescription("Receive information about the bot"),
  async execute(interaction) {
    const developerArray = ["Tetie#4242"];
    const replyEmbed = new EmbedBuilder()
      .addFields(
        {
          name: `Name`,
          value: `BobTheBot`,
          inline: true,
        },
        {
          name: `ID`,
          value: `1036359071508484237`,
          inline: true,
        },
        {
          name: `Developers`,
          value: `${developerArray.join(", ") || "None"}`,
          inline: true,
        },
        {
          name: `Dependency versions`,
          value: `NodeJS: \`v18.12.0\`\nDiscord.JS: \`14.7.0\`\nMongoose: \`6.7.0\``,
          inline: true,
        },
        {
          name: `Links`,
          value:
            "[**Github**](https://github.com/UndefinedToast/BobTheBot)\n[**Discord**](https://discord.gg/FJ5DMEb8zA)",
          inline: true,
        }
      )
      .setColor(roleColor(interaction))
      .setTimestamp();
    interaction.reply({
      embeds: [replyEmbed],
    });
  },
  requiredPerms: requiredPerms,
};
