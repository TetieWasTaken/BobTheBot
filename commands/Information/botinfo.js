const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { EmbedBuilder } = require("discord.js");

const requiredBotPerms = {
  type: "flags",
  key: [],
};

const requiredUserPerms = {
  type: "flags",
  key: [],
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
      .setColor(interaction.guild.members.me.displayHexColor)
      .setTimestamp();
    interaction.reply({
      embeds: [replyEmbed],
    });
  },
  requiredBotPerms: requiredBotPerms,
  requiredUserPerms: requiredUserPerms,
};
