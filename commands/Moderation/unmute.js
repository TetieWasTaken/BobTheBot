const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits } = require("discord.js");
const {
  raiseUserPermissionsError,
  raiseBotPermissionsError,
  raiseUserHierarchyError,
  raiseBotHierarchyError,
} = require("../../utils/returnError.js");

const requiredBotPerms = {
  type: "flags",
  key: [PermissionFlagsBits.ModerateMembers, PermissionFlagsBits.SendMessages],
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unmute")
    .setDescription("Removes a user from timeout")
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("member to mute")
        .setRequired(true)
    ),
  async execute(interaction) {
    const member = interaction.options.getMember("target");

    if (
      !interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)
    )
      return raiseUserPermissionsError(interaction, "MODERATE_MEMBERS");

    if (
      !interaction.guild.members.me.permissions.has(
        PermissionFlagsBits.ModerateMembers
      )
    )
      return raiseBotPermissionsError(interaction, "MODERATE_MEMBERS");

    const authorMember = await interaction.guild.members.fetch(
      interaction.user.id
    );

    const highestUserRole = member.roles.highest;
    if (highestUserRole.position >= authorMember.roles.highest.position)
      return raiseUserHierarchyError(interaction);

    if (
      highestUserRole.position >=
      interaction.guild.members.me.roles.highest.position
    )
      return raiseBotHierarchyError(interaction);

    await member.timeout(1000);

    interaction.reply({
      content: `:loud_sound:  \`${member.user.tag}\` has been unmuted`,
      ephemeral: true,
    });
  },
  requiredBotPerms: requiredBotPerms,
};
