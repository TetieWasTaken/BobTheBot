import { SlashCommandBuilder, EmbedBuilder, time, ChannelType, type ChatInputCommandInteraction } from "discord.js";
import { Color } from "../../constants.js";

const requiredBotPerms = {
  type: "flags" as const,
  key: [] as const,
};

const requiredUserPerms = {
  type: "flags" as const,
  key: [] as const,
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("channelinfo")
    .setDescription("Receive information about the current channel")
    .setDMPermission(false),
  async execute(interaction: ChatInputCommandInteraction<"cached">) {
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
          value: `${ChannelType[channel.type].replace(/Guild/g, " ")}`,
          inline: true,
        },
        {
          name: `ID`,
          value: `${channel.id}`,
          inline: true,
        },
        {
          name: `Created at`,
          value: `${channel.createdTimestamp ? time(Math.round(channel.createdTimestamp / 1000), "D") : "Unknown"}`,
          inline: true,
        },
        {
          name: `Position`,
          value: `${!channel.isThread() ? channel.position + 1 : "Unknown"}`,
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
  },
  requiredBotPerms: requiredBotPerms,
  requiredUserPerms: requiredUserPerms,
};
