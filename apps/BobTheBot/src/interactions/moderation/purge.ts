import {
  ApplicationCommandOptionType,
  PermissionFlagsBits,
  Collection,
  type ChatInputCommandInteraction,
} from "discord.js";
import { permissionToString, type ChatInputCommand } from "../../utils/index.js";

export const RequiredPerms = {
  bot: [PermissionFlagsBits.ManageMessages],
  user: [PermissionFlagsBits.ManageMessages],
} as const;

export const PurgeCommand: ChatInputCommand = {
  name: "purge",
  description: "Bulk deletes a specific amount of messages",
  options: [
    {
      name: "amount",
      description: "The amount of messages to delete",
      type: ApplicationCommandOptionType.Integer,
      min_value: 1,
      max_value: 100,
      required: true,
    },
  ],
  default_member_permissions: permissionToString(RequiredPerms.user),
  dm_permission: false,
} as const;

export async function execute(interaction: ChatInputCommandInteraction<"cached">) {
  const amount = interaction.options.getInteger("amount", true);

  if (!interaction.channel) return interaction.reply({ content: "Something went wrong", ephemeral: true });

  const messages = await interaction.channel.bulkDelete(amount).catch(async () => {
    return interaction.reply({
      content: "Something went wrong while purging messages",
      ephemeral: true,
    });
  });

  if (!(messages instanceof Collection)) return;

  await interaction.reply({
    content: `:mag: Purged ${messages.size} messages`,
    ephemeral: true,
  });
}
