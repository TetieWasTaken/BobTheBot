const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("invite")
    .setDescription("Receive an invite link for the bot"),
  async execute(interaction) {
    let roleColor = "ffffff";
    const member = interaction.guild.members.cache.get(
      interaction.client.user.id
    );
    const roleCacheSize = member.roles.cache.size;
    if (roleCacheSize >= 2) {
      if (member.roles.color !== null) {
        roleColor = member.roles.color.hexColor;
      }
    }

    const replyEmbed = new EmbedBuilder()
      .setTitle("Invite BobTheBot")
      .setDescription(
        "[**Click here to invite BobTheBot to your server**](https://discord.com/api/oauth2/authorize?client_id=1036359071508484237&permissions=8&scope=bot%20applications.commands)"
      )
      .setColor(roleColor)
      .setTimestamp();
    interaction.reply({
      embeds: [replyEmbed],
    });
  },
};
