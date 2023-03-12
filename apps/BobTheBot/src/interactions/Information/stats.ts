import { SlashCommandBuilder, EmbedBuilder, type ChatInputCommandInteraction, type Guild } from "discord.js";
import { Color } from "../../constants.js";
import { convertMS } from "../../utils/index.js";

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
    .setName("stats")
    .setDescription("Receive statistics about the bot")
    .setDMPermission(true),
  async execute(interaction: ChatInputCommandInteraction) {
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
            // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
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
  },
  requiredBotPerms,
  requiredUserPerms,
};
