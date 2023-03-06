import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction } from "discord.js";
import { raiseUserHierarchyError, raiseBotHierarchyError } from "../../utils/index.js";

const requiredBotPerms = {
  type: "flags" as const,
  key: [PermissionFlagsBits.ModerateMembers] as const,
};

const requiredUserPerms = {
  type: "flags" as const,
  key: [PermissionFlagsBits.ModerateMembers] as const,
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unmute")
    .setDescription("Removes a user from timeout")
    .addUserOption((option) => option.setName("target").setDescription("member to mute").setRequired(true))
    .setDefaultMemberPermissions(...requiredUserPerms.key)
    .setDMPermission(false),
  async execute(interaction: ChatInputCommandInteraction<"cached">) {
    const member = interaction.options.getMember("target");

    if (!member || !interaction.guild.members.me)
      return interaction.reply({ content: "Something went wrong", ephemeral: true });

    const authorMember = await interaction.guild.members.fetch(interaction.user.id);

    const highestUserRole = member.roles.highest;
    if (highestUserRole.position >= authorMember.roles.highest.position) return raiseUserHierarchyError(interaction);

    if (highestUserRole.position >= interaction.guild.members.me.roles.highest.position)
      return raiseBotHierarchyError(interaction);

    await member
      .timeout(null)
      .then(() => {
        return interaction.reply({
          content: `:loud_sound:  \`${member.user.tag}\` has been unmuted`,
          ephemeral: true,
        });
      })
      .catch(() => {
        return interaction.reply({
          content: `:x:  Unable to unmute \`${member.user.tag}\``,
          ephemeral: true,
        });
      });

    return;
  },
  requiredBotPerms: requiredBotPerms,
  requiredUserPerms: requiredUserPerms,
};
