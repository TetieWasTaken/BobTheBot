const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Bans a user from the current guild")
    .addUserOption((option) =>
      option.setName("target").setDescription("member to ban").setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("reason for ban")
        .setRequired(true)
    ),
  async execute(interaction) {
    const user = interaction.options.getUser("target");
    const reason = interaction.options.getString("reason");

    if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      return interaction.reply({
        content: "You do not have the `BAN_MEMBERS` permission!",
        ephemeral: true,
      });
    }

    const member = await interaction.guild.members.fetch(user.id);
    await member.ban({ days: 1, reason: reason });

    interaction.reply({
      content: `:hammer:  \`${user.username}#${user.discriminator}\` has been banned for \`${reason}\``,
      ephemeral: true,
    });
  },
};
