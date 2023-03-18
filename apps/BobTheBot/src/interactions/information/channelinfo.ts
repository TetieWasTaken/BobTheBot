import { EmbedBuilder, ChannelType, type ChatInputCommandInteraction } from "discord.js";
import { Color } from "../../constants.js";
import { permissionToString, type ChatInputCommand } from "../../utils/index.js";

export const RequiredPerms = {
  bot: [],
  user: [],
} as const;

export const ChannelinfoCommand: ChatInputCommand = {
  name: "channelinfo",
  description: "Get information about the current channel",
  default_member_permissions: permissionToString(RequiredPerms.user),
  dm_permission: false,
} as const;

export async function execute(interaction: ChatInputCommandInteraction<"cached">) {
  const channel = interaction.channel;

  if (!channel)
    return interaction.reply({ content: "Something went wrong getting the current channel", ephemeral: true });

  const replyEmbed = new EmbedBuilder()
    .setColor(interaction.guild?.members?.me?.displayHexColor ?? Color.DiscordPrimary)
    .setAuthor({
      name: `${channel.name}`,
      iconURL: interaction.guild.iconURL() ?? undefined,
    })
    .addFields(
      { name: `Name`, value: `${channel.name}`, inline: true },
      {
        name: `Type`,
        value: `${ChannelType[channel.type].replaceAll("Guild", " ")}`,
        inline: true,
      },
      {
        name: `ID`,
        value: `${channel.id}`,
        inline: true,
      },
      {
        name: `Created at`,
        value: `${channel.createdTimestamp ? `<t:${Math.round(channel.createdTimestamp / 1_000)}:D>` : "Unknown"}`,
        inline: true,
      },
      {
        name: `Position`,
        value: `${channel.isThread() ? "Unknown" : channel.position + 1}`,
        inline: true,
      },
      {
        name: `Category`,
        value: `${channel.parent ? channel.parent.name : "None"}`,
        inline: true,
      }
    )
    .setTimestamp();

  return interaction.reply({
    embeds: [replyEmbed],
  });
}
