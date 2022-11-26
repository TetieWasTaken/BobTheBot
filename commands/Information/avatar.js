const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");

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
    let user = interaction.options.getUser("target");

    if (user === null) {
      user = interaction.user;
    }

    const member = await interaction.guild.members.fetch(user.id);
    let roleColor = "ffffff";
    const roleCacheSize = member.roles.cache.size;
    if (roleCacheSize >= 2) {
      if (member.roles.color !== null) {
        roleColor = member.roles.color.hexColor;
      }
    }

    const replyEmbed = new EmbedBuilder()
      .setTitle(user.username)
      .setFooter({ text: `${user.id}` })
      .setThumbnail(user.bannerURL())
      .setImage(user.displayAvatarURL({ dynamic: true, size: 256 }))
      .setColor(roleColor)
      .setTimestamp();

    interaction.reply({
      embeds: [replyEmbed],
    });
  },
};
