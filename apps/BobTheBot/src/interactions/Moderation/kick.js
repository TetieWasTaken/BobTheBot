const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { raiseUserHierarchyError, raiseBotHierarchyError } = require("../../utils/returnError.js");

const requiredBotPerms = {
  type: "flags",
  key: [PermissionFlagsBits.KickMembers],
};

const requiredUserPerms = {
  type: "flags",
  key: [PermissionFlagsBits.KickMembers],
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kicks a user from the current guild")
    .addUserOption((option) => option.setName("target").setDescription("member to kick").setRequired(true))
    .addStringOption((option) =>
      option.setName("reason").setDescription("reason for kick").setMaxLength(255).setRequired(false)
    ),
  async execute(interaction) {
    const member = interaction.options.getMember("target");
    let reason = interaction.options.getString("reason") ?? "No reason provided";

    const authorMember = await interaction.guild.members.fetch(interaction.user.id);

    const highestUserRole = member.roles.highest;

    if (highestUserRole.position >= authorMember.roles.highest.position) return raiseUserHierarchyError(interaction);

    if (highestUserRole.position >= interaction.guild.members.me.roles.highest.position)
      return raiseBotHierarchyError(interaction);

    const userMsg = await member
      .send(`👟 You have been kicked from \`${interaction.guild.name}\` for \`${reason}\``)
      .catch(() => null);

    try {
      member.kick(reason);
    } catch (error) {
      userMsg?.delete();
      return interaction.reply({
        content: `❌  I was unable to kick \`${member.user.tag}\``,
        ephemeral: true,
      });
    }

    return interaction.reply({
      content: `👟  \`${member.user.tag}\` has been kicked for \`${reason}\``,
      ephemeral: true,
    });
  },
  requiredBotPerms: requiredBotPerms,
  requiredUserPerms: requiredUserPerms,
};
