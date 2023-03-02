import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from "discord.js";
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
  data: new SlashCommandBuilder().setName("rankings").setDescription("Shows the top 10 richest people!"),
  async execute(interaction: ChatInputCommandInteraction<"cached">) {
    const data = await EconomyModel.find().sort({ NetWorth: -1 }).limit(10);
    data.sort((a, b) => {
      if (!a.NetWorth || !b.NetWorth) return 0;
      return b.NetWorth - a.NetWorth;
    });

    const embed = new EmbedBuilder()
      .setTitle("Leaderboard")
      .setColor(0x57f287)
      .setFooter({
        text: `Requested by ${interaction.user.tag}`,
        iconURL: `${interaction.user.displayAvatarURL()}`,
      });

    const fieldsArray = [];

    for (const [index, user] of data.entries()) {
      if (!user.UserId) continue;

      const member = await interaction.guild.members.fetch(user.UserId);
      fieldsArray.push({
        name: `${index + 1}. ${member.displayName}`,
        value: `**Net Worth:** ${user.NetWorth}`,
        inline: false,
      });
    }

    await interaction.reply({ embeds: [embed] });
  },
  requiredBotPerms: requiredBotPerms,
  requiredUserPerms: requiredUserPerms,
};
