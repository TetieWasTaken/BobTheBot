import { ApplicationCommandOptionType, PermissionFlagsBits, type ChatInputCommandInteraction } from "discord.js";
import { permissionToString, type ChatInputCommand } from "../../utils/index.js";

export const RequiredPerms = {
  bot: [PermissionFlagsBits.BanMembers],
  user: [PermissionFlagsBits.BanMembers],
} as const;

export const UnbanCommand: ChatInputCommand = {
  name: "unban",
  description: "Unban a user from the guild",
  options: [
    {
      name: "id",
      description: "The id of the user to unban",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: "reason",
      description: "The reason for unbanning the user",
      type: ApplicationCommandOptionType.String,
      required: false,
    },
  ],
  default_member_permissions: permissionToString(RequiredPerms.user),
  dm_permission: false,
} as const;

export async function execute(interaction: ChatInputCommandInteraction<"cached">) {
  const userId = interaction.options.getString("userid", true);
  const reason = interaction.options.getString("reason") ?? undefined;

  await interaction.guild.bans
    .remove(userId, reason)
    .then(async (user) => {
      return interaction.reply({
        content: `:scales: ${user?.tag ?? userId} has been unbanned`,
        ephemeral: true,
      });
    })
    .catch(async () => {
      return interaction.reply({
        content: "Something went wrong while unbanning this user, please try manually unbanning them.",
        ephemeral: true,
      });
    });
}
