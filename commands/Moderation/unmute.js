const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits } = require("discord.js");

const requiredPerms = {
  type: "flags",
  key: PermissionFlagsBits.ModerateMembers,
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
    ) {
      return interaction.reply({
        content: "You do not have the `MODERATE_MEMBERS` permission!",
        ephemeral: true,
      });
    }

    if (
      !interaction.guild.members.me.permissions.has(
        PermissionFlagsBits.ModerateMembers
      )
    ) {
      return interaction.reply({
        content: ":wrench: I do not have the `MODERATE_MEMBERS` permission!",
        ephemeral: true,
      });
    }

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

    await member.timeout(1000);

    interaction.reply({
      content: `:loud_sound:  \`${member.user.username}#${member.user.discriminator}\` has been unmuted`,
      ephemeral: true,
    });
  },
  requiredPerms: requiredPerms,
};
