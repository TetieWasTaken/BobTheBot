import {
  ApplicationCommandOptionType,
  PermissionFlagsBits,
  type Role,
  type ChatInputCommandInteraction,
} from "discord.js";
import {
  permissionToString,
  raiseUserHierarchyError,
  raiseBotHierarchyError,
  type ChatInputCommand,
} from "../../utils/index.js";

export const RequiredPerms = {
  bot: [PermissionFlagsBits.KickMembers],
  user: [PermissionFlagsBits.KickMembers],
} as const;

export const KickCommand: ChatInputCommand = {
  name: "kick",
  description: "Kick a member from the guild",
  options: [
    {
      name: "member",
      description: "The member to target",
      type: ApplicationCommandOptionType.User,
      required: true,
    },
    {
      name: "reason",
      description: "The reason for the kick",
      type: ApplicationCommandOptionType.String,
      required: false,
    },
  ],
  default_member_permissions: permissionToString(RequiredPerms.user),
  dm_permission: false,
} as const;

export async function execute(interaction: ChatInputCommandInteraction<"cached">) {
  const member = interaction.options.getMember("member");
  const reason = interaction.options.getString("reason") ?? "No reason provided";

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
    await member.kick(reason);
  } catch {
    await userMsg?.delete().catch(() => null);
    return interaction.reply({
      content: `❌  I was unable to kick \`${member.user.tag}\``,
      ephemeral: true,
    });
  }

  return interaction.reply({
    content: `👟  \`${member.user.tag}\` has been kicked for \`${reason}\``,
    ephemeral: true,
  });
}
