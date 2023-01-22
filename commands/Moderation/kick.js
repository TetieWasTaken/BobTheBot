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

    try {
      await member.send(
        `:athletic_shoe: You have been kicked from \`${interaction.guild.name}\` for \`${reason}\``
      );
    } catch (error) {
      // Ignore error
    } finally {
      try {
        member.kick({ reason: reason });
      } catch (error) {
        try {
          member.timeout({
            reason: "Failed to kick member",
            time: 1000 * 60 * 60 * 24 * 7,
          });
          return interaction.reply({
            content: `:wrench: I was unable to kick \`${member.user.tag}\` for an unknown reason. Please try again later\n\n**Note:** This user has been timed out as a result of this failed action.`,
            ephemeral: true,
          });
        } catch (error) {
          console.error(error);
          return interaction.reply({
            content: `:wrench: I was unable to kick \`${member.user.tag}\` for an unknown reason. Please try again later`,
            ephemeral: true,
          });
        }
      }
    }

    interaction.reply({
      content: `:athletic_shoe:  \`${member.user.tag}\` has been kicked for \`${reason}\``,
      ephemeral: true,
    });
  },
  requiredPerms: requiredPerms,
};
