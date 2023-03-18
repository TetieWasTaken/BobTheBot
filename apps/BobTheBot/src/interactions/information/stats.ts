import { EmbedBuilder, type ChatInputCommandInteraction, type Guild } from "discord.js";
import { Color } from "../../constants.js";
import { permissionToString, convertMS, type ChatInputCommand } from "../../utils/index.js";

export const RequiredPerms = {
  bot: [],
  user: [],
} as const;

export const StatsCommand: ChatInputCommand = {
  name: "stats",
  description: "Get information about the bot",
  default_member_permissions: permissionToString(RequiredPerms.user),
  dm_permission: true,
} as const;

export async function execute(interaction: ChatInputCommandInteraction) {
  const milliseconds = interaction.client.uptime;

  const replyEmbed = new EmbedBuilder()
    .setColor(interaction.guild?.members?.me?.displayHexColor ?? Color.DiscordPrimary)
    .setTitle(`${interaction.client.user.tag} (${interaction.client.user.id}))`)
    .setDescription("🧮 Statistics about the bot")
    .addFields(
      {
        name: `Servers`,
        value: `\`${interaction.client.guilds.cache.size}\``,
        inline: true,
      },
      {
        name: `Users`,
        value: `\`${interaction.client.guilds.cache.reduce(
          (acc: number, guild: Guild) => acc + guild.memberCount,
          0
        )}\``,
        inline: true,
      },
      {
        name: `Channels`,
        value: `\`${interaction.client.channels.cache.size}\``,
        inline: true,
      },
      {
        name: `Uptime`,
        value: `${convertMS(milliseconds)}`,
        inline: true,
      }
    );

  return interaction.reply({ embeds: [replyEmbed] });
}
