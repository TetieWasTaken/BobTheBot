const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits } = require("discord.js");

const requiredPerms = {
  type: "flags",
  key: [PermissionFlagsBits.KickMembers, PermissionFlagsBits.SendMessages],
};

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
        .setMaxLength(255)
        .setRequired(false)
    ),
  async execute(interaction) {
    const member = interaction.options.getMember("target");
    let reason =
      interaction.options.getString("reason") ?? "No reason provided";

    if (!interaction.member.permissions.has(PermissionFlagsBits.KickMembers)) {
      return interaction.reply({
        content: "You do not have the `KICK_MEMBERS` permission!",
        ephemeral: true,
      });
    }

    if (
      !interaction.guild.members.me.permissions.has(
        PermissionFlagsBits.KickMembers
      )
    ) {
      return interaction.reply({
        content: ":wrench: I do not have the `KICK_MEMBERS` permission!",
        ephemeral: true,
      });
    }

    const authorMember = await interaction.guild.members.fetch(
      interaction.user.id
    );

    const highestUserRole = member.roles.highest;
    if (
      highestUserRole.position >=
      interaction.guild.members.me.roles.highest.position
    ) {
      return interaction.reply({
        content: `:wrench: Please make sure my role is above the ${highestUserRole} role!`,
        ephemeral: true,
      });
    }
    if (highestUserRole.position >= authorMember.roles.highest.position) {
      return interaction.reply({
        content: `:wrench: ${member} has a higher or equal role than you on the hierarchy!`,
        ephemeral: true,
      });
    }

    await member.kick(reason);

    interaction.reply({
      content: `:athletic_shoe:  \`${member.user.username}#${member.user.discriminator}\` has been kicked for \`${reason}\``,
      ephemeral: true,
    });
  },
  requiredPerms: requiredPerms,
};
