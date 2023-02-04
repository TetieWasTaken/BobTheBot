const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits } = require("discord.js");
const {
  raiseUserHierarchyError,
  raiseBotHierarchyError,
} = require("../../utils/returnError.js");

const requiredBotPerms = {
  type: "flags",
  key: [PermissionFlagsBits.ModerateMembers],
};

const requiredUserPerms = {
  type: "flags",
  key: [PermissionFlagsBits.ModerateMembers],
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
  requiredUserPerms: requiredUserPerms,
};
