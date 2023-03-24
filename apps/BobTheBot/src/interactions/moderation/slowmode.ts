import { PermissionFlagsBits, ApplicationCommandOptionType, type ChatInputCommandInteraction } from "discord.js";
import { permissionToString, type ChatInputCommand } from "../../utils/index.js";

export const RequiredPerms = {
  bot: [PermissionFlagsBits.ManageChannels],
  user: [PermissionFlagsBits.ManageChannels],
} as const;

export const SlowmodeCommand: ChatInputCommand = {
  name: "slowmode",
  description: "Set the slowmode for the current channel",
  options: [
    {
      name: "time",
      description: "The time to set the slowmode to",
      type: ApplicationCommandOptionType.Integer,
      min_value: 0,
      max_value: 21_600,
      required: true,
    },
  ],
  default_member_permissions: permissionToString(RequiredPerms.user),
  dm_permission: false,
} as const;

export async function execute(interaction: ChatInputCommandInteraction<"cached">) {
  const duration = interaction.options.getInteger("duration", true);

  if (!interaction.channel) return interaction.reply({ content: "Something went wrong", ephemeral: true });

  await interaction.channel.setRateLimitPerUser(duration).catch(async () => {
    return interaction.reply({
      content: "❌ I don't have the permissions to adjust the slowmode",
      ephemeral: true,
    });
  });

  let reply = `:rabbit2: Slowmode has been turned off!`;
  if (duration === 1) {
    reply = `:turtle: Slowmode has been set to ${duration} second!`;
  } else if (duration <= 5 && duration > 1) {
    reply = `:turtle: Slowmode has been set to ${duration} seconds!`;
  } else if (duration >= 6) {
    reply = `:sloth: Slowmode has been set to ${duration} seconds!`;
  }

  return interaction.reply({
    content: `${reply}`,
    ephemeral: true,
  });
}
