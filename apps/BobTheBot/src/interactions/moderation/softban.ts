import { ApplicationCommandOptionType, type ChatInputCommandInteraction } from "discord.js";
import { permissionToString, type ChatInputCommand } from "../../utils/index.js";

export const RequiredPerms = {
  bot: [],
  user: [],
} as const;

export const SoftbanCommand: ChatInputCommand = {
  name: "softban",
  description: "Softbans a user from the guild",
  options: [
    {
      name: "user",
      description: "The user to softban",
      type: ApplicationCommandOptionType.User,
      required: true,
    },
    {
      name: "reason",
      description: "The reason for the softban",
      type: ApplicationCommandOptionType.String,
      required: false,
    },
  ],
  default_member_permissions: permissionToString(RequiredPerms.user),
  dm_permission: false,
} as const;

export async function execute(interaction: ChatInputCommandInteraction<"cached">) {
  const user = interaction.options.getUser("user", true);
  const reason = interaction.options.getString("reason") ?? "No reason provided";

  await interaction.guild.bans.create(user.id, {
    reason: `(softban): ${reason}`,
    deleteMessageSeconds: 60 * 60 * 24 * 7,
  });
  await interaction.guild.bans.remove(user.id, `(softban): ${reason}`);

  return interaction.reply({
    content: `Softbanned ${user.tag} from the guild`,
    ephemeral: true,
  });
}
