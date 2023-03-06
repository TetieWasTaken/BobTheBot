import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction } from "discord.js";
import { raiseUserHierarchyError, raiseBotHierarchyError } from "../../utils/index.js";

const requiredBotPerms = {
  type: "flags" as const,
  key: [PermissionFlagsBits.BanMembers] as const,
};

const requiredUserPerms = {
  type: "flags" as const,
  key: [PermissionFlagsBits.BanMembers] as const,
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Bans a user from the current guild")
    .addUserOption((option) => option.setName("target").setDescription("member to ban").setRequired(true))
    .addStringOption((option) =>
      option.setName("reason").setDescription("reason for ban").setMaxLength(255).setRequired(false)
    )
    .setDefaultMemberPermissions(...requiredUserPerms.key)
    .setDMPermission(false),
  async execute(interaction: ChatInputCommandInteraction<"cached">) {
    const member = interaction.options.getMember("target");
    let reason = interaction.options.getString("reason") ?? "No reason provided";

    if (!member || !interaction.guild.members.me)
      return interaction.reply({ content: "Something went wrong", ephemeral: true });

    const authorMember = await interaction.guild.members.fetch(interaction.user.id);

    const highestUserRole = member.roles.highest;
    if (highestUserRole.position >= authorMember.roles.highest.position) return raiseUserHierarchyError(interaction);

    if (highestUserRole.position >= interaction.guild.members.me.roles.highest.position)
      return raiseBotHierarchyError(interaction);

    try {
      await member.ban({
        deleteMessageSeconds: 604800,
        reason: reason,
      });
    } catch (error) {
      try {
        await member.kick(reason);
      } catch (error) {
        try {
          await member.timeout(1000 * 60 * 60 * 24 * 7, reason);
        } catch (error) {
          return interaction.reply({
            content: `:wrench: An error occurred while trying to ban ${member.user.tag}!\nAn unsuccessfull attempt was made to kick but failed as well! Please manually ban the user.`,
            ephemeral: true,
          });
        }
        return interaction.reply({
          content: `:wrench: An error occurred while trying to ban ${member.user.tag}!\nAn unsuccessfull attempt was made to kick but failed as well! Please manually ban the user.`,
          ephemeral: true,
        });
      }
      return interaction.reply({
        content: `:wrench: An error occurred while trying to ban ${member.user.tag}!\nThey were kicked instead!`,
        ephemeral: true,
      });
    }

    return interaction.reply({
      content: `:hammer:  \`${member.user.tag}\` has been banned for \`${reason}\``,
      ephemeral: true,
    });
  },
  requiredBotPerms: requiredBotPerms,
  requiredUserPerms: requiredUserPerms,
};
