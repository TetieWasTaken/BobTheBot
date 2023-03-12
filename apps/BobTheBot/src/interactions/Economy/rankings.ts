import { SlashCommandBuilder, EmbedBuilder, type ChatInputCommandInteraction } from "discord.js";
import { Color } from "../../constants.js";
import { EconomyModel } from "../../models/index.js";

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
    .setName("rankings")
    .setDescription("Shows the top 10 richest people!")
    .setDMPermission(true),
  async execute(interaction: ChatInputCommandInteraction) {
    const data = await EconomyModel.find().sort({ NetWorth: -1 }).limit(10);
    data.sort((a, b) => {
      if (!a.NetWorth || !b.NetWorth) return 0;
      return b.NetWorth - a.NetWorth;
    });

    const embed = new EmbedBuilder()
      .setTitle("Leaderboard")
      .setColor(Color.DiscordPrimary)
      .setFooter({
        text: `Requested by ${interaction.user.tag}`,
        iconURL: `${interaction.user.displayAvatarURL()}`,
      });

    for (const [index, doc] of data.entries()) {
      if (!doc.UserId) continue;

      const user = await interaction.client.users.fetch(doc.UserId);
      embed.addFields({
        name: `${index + 1}. ${user.username}`,
        value: `**Net Worth:** ${doc.NetWorth}`,
        inline: false,
      });
    }

    await interaction.reply({ embeds: [embed] });
  },
  requiredBotPerms,
  requiredUserPerms,
};
