import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from "discord.js";
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
  data: new SlashCommandBuilder().setName("stats").setDescription("Receive statistics about the bot"),
  async execute(interaction: ChatInputCommandInteraction<"cached">) {
    let milliseconds = interaction.client.uptime;

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
          value: `\`${interaction.client.users.cache.size}\``,
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
    interaction.reply({ embeds: [replyEmbed] });
  },
  requiredBotPerms: requiredBotPerms,
  requiredUserPerms: requiredUserPerms,
};
