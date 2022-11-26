const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kicks a user from the current guild")
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("member to kick")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("reason for kick")
        .setRequired(true)
    ),
  async execute(interaction) {
    const user = interaction.options.getUser("target");
    const reason = interaction.options.getString("reason");

    if (!interaction.member.permissions.has(PermissionFlagsBits.KickMembers)) {
      return interaction.reply({
        content: "You do not have the `KICK_MEMBERS` permission!",
        ephemeral: true,
      });
    }

    const member = await interaction.guild.members.fetch(user.id);
    await member.kick(reason);

    interaction.reply({
      content: `:athletic_shoe:  \`${user.username}#${user.discriminator}\` has been kicked for \`${reason}\``,
      ephemeral: true,
    });
  },
};
