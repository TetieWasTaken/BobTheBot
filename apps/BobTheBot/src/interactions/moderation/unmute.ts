import { ApplicationCommandOptionType, PermissionFlagsBits, type ChatInputCommandInteraction } from "discord.js";
import {
  permissionToString,
  raiseUserHierarchyError,
  raiseBotHierarchyError,
  type ChatInputCommand,
} from "../../utils/index.js";

export const RequiredPerms = {
  bot: [PermissionFlagsBits.ModerateMembers],
  user: [PermissionFlagsBits.ModerateMembers],
} as const;

export const UnmuteCommand: ChatInputCommand = {
  name: "unmute",
  description: "Removes a user from timeout",
  options: [
    {
      name: "member",
      description: "The member to unmute",
      type: ApplicationCommandOptionType.User,
      required: true,
    },
  ],
  default_member_permissions: permissionToString(RequiredPerms.user),
  dm_permission: false,
} as const;

export async function execute(interaction: ChatInputCommandInteraction<"cached">) {
  const member = interaction.options.getMember("user");

  if (!member || !interaction.guild.members.me)
    return interaction.reply({ content: "Something went wrong", ephemeral: true });

  const authorMember = await interaction.guild.members.fetch(interaction.user.id);

  const highestUserRole = member.roles.highest;
  if (highestUserRole.position >= authorMember.roles.highest.position) return raiseUserHierarchyError(interaction);

  if (highestUserRole.position >= interaction.guild.members.me.roles.highest.position)
    return raiseBotHierarchyError(interaction);

  await member
    .timeout(null)
    .then(async () => {
      return interaction.reply({
        content: `:loud_sound:  \`${member.user.tag}\` has been unmuted`,
        ephemeral: true,
      });
    })
    .catch(async () => {
      return interaction.reply({
        content: `❌  Unable to unmute \`${member.user.tag}\``,
        ephemeral: true,
      });
    });
}
