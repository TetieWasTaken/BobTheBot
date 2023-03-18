import { EmbedBuilder, type ChatInputCommandInteraction } from "discord.js";
import { Color } from "../../constants.js";
import { permissionToString, type ChatInputCommand } from "../../utils/index.js";

export const RequiredPerms = {
  bot: [],
  user: [],
} as const;

export const ServerinfoCommand: ChatInputCommand = {
  name: "serverinfo",
  description: "Get information about the server",
  default_member_permissions: permissionToString(RequiredPerms.user),
  dm_permission: false,
} as const;

export async function execute(interaction: ChatInputCommandInteraction<"cached">) {
  const boostCount = interaction.guild.premiumSubscriptionCount ?? 0;
  const boostTier = boostCount < 2 ? 0 : boostCount < 7 ? 1 : boostCount < 14 ? 2 : 3;

  const owner = await interaction.guild.fetchOwner();

  const replyEmbed = new EmbedBuilder()
    .setColor(interaction.guild?.members?.me?.displayHexColor ?? Color.DiscordPrimary)
    .setAuthor({ name: `${interaction.guild.name}`, iconURL: interaction.guild.iconURL() ?? undefined })
    .addFields(
      {
        name: "General information",
        value: `
          *Owner:* \`${owner.user.tag}\`
                *Member count:* \`${interaction.guild.memberCount}\`
                *Boosts:* \`${boostCount}\``,
        inline: true,
      },
      {
        name: "Other",
        value: `
          *Roles:* \`${interaction.guild.roles.cache.size - 1}\`
                *Boost tier:* \`${boostTier}\`
                *Channels:* \`${interaction.guild.channels.channelCountWithoutThreads}\``,
        inline: true,
      }
    )
    .setFooter({ text: `${interaction.guild.id}` })
    .setTimestamp();

  return interaction.reply({
    embeds: [replyEmbed],
  });
}
