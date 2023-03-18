import { PermissionFlagsBits, ApplicationCommandOptionType, type ChatInputCommandInteraction } from "discord.js";
import {
  permissionToString,
  raiseUserHierarchyError,
  raiseBotHierarchyError,
  type ChatInputCommand,
} from "../../utils/index.js";

export const RequiredPerms = {
  bot: [PermissionFlagsBits.BanMembers],
  user: [PermissionFlagsBits.BanMembers],
} as const;

export const BanCommand: ChatInputCommand = {
  name: "ban",
  description: "Bans a user from the guild",
  options: [
    {
      name: "user",
      description: "The user to ban",
      type: ApplicationCommandOptionType.User,
      required: true,
    },
    {
      name: "reason",
      description: "The reason for the ban",
      type: ApplicationCommandOptionType.String,
      required: false,
    },
  ],
  default_member_permissions: permissionToString(RequiredPerms.user),
  dm_permission: false,
} as const;

export async function execute(interaction: ChatInputCommandInteraction<"cached">) {
  const member = interaction.options.getMember("target");
  const reason = interaction.options.getString("reason") ?? "No reason provided";

  if (!member || !interaction.guild.members.me)
    return interaction.reply({ content: "Something went wrong", ephemeral: true });

  const authorMember = await interaction.guild.members.fetch(interaction.user.id);

  const highestUserRole = member.roles.highest;
  if (highestUserRole.position >= authorMember.roles.highest.position) return raiseUserHierarchyError(interaction);

  if (highestUserRole.position >= interaction.guild.members.me.roles.highest.position)
    return raiseBotHierarchyError(interaction);

  try {
    await member.ban({
      deleteMessageSeconds: 604_800,
      reason,
    });
  } catch {
    try {
      await member.kick(reason);
    } catch {
      try {
        await member.timeout(1_000 * 60 * 60 * 24 * 7, reason);
      } catch {
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
}
