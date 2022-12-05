const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits } = require("discord.js");
const { EmbedBuilder } = require("discord.js");

const requiredPerms = {
  type: "flags",
  key: PermissionFlagsBits.SendMessages,
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("avatar")
    .setDescription("Returns the avatar of the user specified")
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("user to target")
        .setRequired(false)
    ),
  async execute(interaction) {
    let member = interaction.options.getMember("target") ?? interaction.member;

    let roleColor = "ffffff";
    const roleCacheSize = member.roles.cache.size;
    if (roleCacheSize >= 2) {
      if (member.roles.color !== null) {
        roleColor = member.roles.color.hexColor;
      }
    }

    const replyEmbed = new EmbedBuilder()
      .setTitle(member.user.username)
      .setFooter({ text: `${member.id}` })
      .setThumbnail(member.user.bannerURL())
      .setImage(member.displayAvatarURL({ dynamic: true, size: 256 }))
      .setColor(roleColor)
      .setTimestamp();

    interaction.reply({
      embeds: [replyEmbed],
    });
  },
  requiredPerms: requiredPerms,
};
