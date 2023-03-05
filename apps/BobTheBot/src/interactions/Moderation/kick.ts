import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction, Role } from "discord.js";
import { raiseUserHierarchyError, raiseBotHierarchyError } from "../../utils/index.js";

const requiredBotPerms = {
  type: "flags" as const,
  key: [PermissionFlagsBits.KickMembers] as const,
};

const requiredUserPerms = {
  type: "flags" as const,
  key: [PermissionFlagsBits.KickMembers] as const,
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kicks a user from the current guild")
    .addUserOption((option) => option.setName("target").setDescription("member to kick").setRequired(true))
    .addStringOption((option) =>
      option.setName("reason").setDescription("reason for kick").setMaxLength(255).setRequired(false)
    )
    .setDefaultMemberPermissions(...requiredUserPerms.key),
  async execute(interaction: ChatInputCommandInteraction<"cached">) {
    const member = interaction.options.getMember("target");
    let reason = interaction.options.getString("reason") ?? "No reason provided";

    if (!member || !interaction.guild.members.me)
      return interaction.reply({ content: "Something went wrong", ephemeral: true });

    const highestUserRole: Role = member.roles.highest;

    if (highestUserRole.position >= interaction.member.roles.highest.position)
      return raiseUserHierarchyError(interaction);

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
