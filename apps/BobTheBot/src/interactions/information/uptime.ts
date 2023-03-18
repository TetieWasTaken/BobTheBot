import { EmbedBuilder, type ChatInputCommandInteraction } from "discord.js";
import { Color } from "../../constants.js";
import { permissionToString, convertMS, type ChatInputCommand } from "../../utils/index.js";

export const RequiredPerms = {
  bot: [],
  user: [],
} as const;

export const UptimeCommand: ChatInputCommand = {
  name: "uptime",
  description: "Returns the uptime of the bot",
  default_member_permissions: permissionToString(RequiredPerms.user),
  dm_permission: true,
} as const;

export async function execute(interaction: ChatInputCommandInteraction) {
  const replyEmbed = new EmbedBuilder()
    .setTitle("⏱️ Uptime")
    .setDescription(`${convertMS(interaction.client.uptime)}`)
    .setColor(interaction.guild?.members?.me?.displayHexColor ?? Color.DiscordPrimary)
    .setFooter({ text: `${interaction.client.uptime}ms` });

  return interaction.reply({ embeds: [replyEmbed] });
}
