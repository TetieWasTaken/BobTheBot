const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const { roleColor } = require("../../functions/roleColor.js");

const requiredPerms = {
  type: "flags",
  key: PermissionFlagsBits.SendMessages,
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("invite")
    .setDescription("Receive an invite link for the bot"),
  async execute(interaction) {
    const replyEmbed = new EmbedBuilder()
      .setTitle("Invite BobTheBot")
      .setDescription(
        "[**Click here to invite BobTheBot to your server**](https://discord.com/api/oauth2/authorize?client_id=1036359071508484237&permissions=8&scope=bot%20applications.commands)"
      )
      .setColor(roleColor(interaction))
      .setTimestamp();
    interaction.reply({
      embeds: [replyEmbed],
    });
  },
  requiredPerms: requiredPerms,
};
