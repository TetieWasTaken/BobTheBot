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
        .setRequired(true)
    ),
  async execute(interaction) {
    const user = interaction.options.getUser("target");

    const replyEmbed = new EmbedBuilder()
      .setTitle(user.username)
      .setFooter({ text: `${interaction.guild.id}` })
      .setThumbnail(user.bannerURL())
      .setImage(user.displayAvatarURL({ dynamic: true, size: 256 }))
      .setTimestamp();

    interaction.reply({
      embeds: [replyEmbed],
    });
  },
};
