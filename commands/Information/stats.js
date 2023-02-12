const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
const { convertMS } = require("../../utils/convertMS.js");

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
    .setName("stats")
    .setDescription("Receive statistics about the bot"),
  async execute(interaction) {
    let milliseconds = interaction.client.uptime;

    const botMember = interaction.guild.members.me;

    let botNickname = ` (${botMember.nickname ?? "null"})`;
    if (botNickname == " (null)") {
      botNickname = "";
    }

    const replyEmbed = new EmbedBuilder()
      .setColor(interaction.guild.members.me.displayHexColor)
      .setTitle(
        `${interaction.client.user.username}#${interaction.client.user.discriminator}` +
          botNickname
      )
      .setDescription("🧮 Statistics about the bot")
      .addFields(
        {
          name: `Servers`,
          value: `\`${interaction.client.guilds.cache.size}\``,
          inline: true,
        },
        {
          name: `Users`,
          value: `\`${interaction.client.users.cache.size}\``,
          inline: true,
        },
        {
          name: `Channels`,
          value: `\`${interaction.client.channels.cache.size}\``,
          inline: true,
        },
        {
          name: `Uptime`,
          value: `${convertMS(milliseconds)}`,
          inline: true,
        }
      );
    interaction.reply({ embeds: [replyEmbed] });
  },
  requiredBotPerms: requiredBotPerms,
  requiredUserPerms: requiredUserPerms,
};
