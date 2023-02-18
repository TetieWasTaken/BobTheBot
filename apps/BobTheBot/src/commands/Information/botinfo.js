const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, version } = require("discord.js");
let mongoose = require("mongoose");

const requiredBotPerms = {
  type: "flags",
  key: [],
};

const requiredUserPerms = {
  type: "flags",
  key: [],
};

module.exports = {
  data: new SlashCommandBuilder().setName("botinfo").setDescription("Receive information about the bot"),
  async execute(interaction) {
    const replyEmbed = new EmbedBuilder()
      .setAuthor({
        name: "BobTheBot",
        iconUrl: interaction.guild.members.me.user.avatarURL,
      })
      .addFields(
        {
          name: `Dependencies`,
          value: `NodeJS: \`${process.version}\`\nDiscord.JS: \`${version}\`\nMongoose: \`${mongoose.version}\``,
          inline: true,
        },
        {
          name: `Legal`,
          value:
            "[**Privacy Policy**](https://github.com/TetieWasTaken/BobTheBot/blob/main/PRIVACY.md)\n[**License**](https://github.com/TetieWasTaken/BobTheBot/blob/main/LICENSE)",
          inline: true,
        },
        {
          name: `Links`,
          value:
            "[**Github**](https://github.com/TetieWasTaken/BobTheBot)\n[**Discord**](https://discord.gg/FJ5DMEb8zA)",
          inline: true,
        },
        {
          name: `Version`,
          value: `Pre-Alpha 0.0.1`, // Placeholder version, will be changed later
          inline: true,
        }
      )
      .setColor(interaction.guild.members.me.displayHexColor)
      .setFooter({
        text: `${interaction.client.user.id}`,
        iconUrl: interaction.user.avatarURL,
      })
      .setTimestamp();
    interaction.reply({
      embeds: [replyEmbed],
    });
  },
  requiredBotPerms: requiredBotPerms,
  requiredUserPerms: requiredUserPerms,
};
