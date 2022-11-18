const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits } = require("discord.js");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unban")
    .setDescription("Unbans a user from the current guild")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addStringOption((option) =>
      option
        .setName("userid")
        .setDescription("discord id for unban")
        .setRequired(true)
    ),
  async execute(interaction) {
    const userId = interaction.options.getString("userid");

    try {
      await interaction.guild.members.unban(userId);

      interaction.reply({
        content: `:scales:  <@!${userId}> has been unbanned`,
        ephemeral: true,
      });
    } catch (err) {
      console.log(err);
    }
  },
};
