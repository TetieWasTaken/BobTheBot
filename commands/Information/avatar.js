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
    .setName("avatar")
    .setDescription("Returns the avatar of the user specified")
    .addUserOption((option) => option.setName("target").setDescription("user to target").setRequired(false)),
  async execute(interaction) {
    let member = interaction.options.getMember("target") ?? interaction.member;

    const replyEmbed = new EmbedBuilder()
      .setTitle(member.user.username)
      .setFooter({ text: `${member.id}` })
      .setThumbnail(member.user.bannerURL())
      .setImage(member.displayAvatarURL({ dynamic: true, size: 256 }))
      .setColor(interaction.guild.members.me.displayHexColor)
      .setTimestamp();

    interaction.reply({
      embeds: [replyEmbed],
    });
  },
  requiredBotPerms: requiredBotPerms,
  requiredUserPerms: requiredUserPerms,
};
