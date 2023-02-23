import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from "discord.js";
import { LevelModel } from "../../models/index.js";

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
    .setName("leaderboard")
    .setDescription("Returns the top 10 users with the most amount of XP"),
  async execute(interaction: ChatInputCommandInteraction<"cached">) {
    const data = await LevelModel.find({ GuildID: interaction.guild.id }).sort({ UserXP: -1 }).limit(10);

    const mappedData = data
      .map((d, i) => `\`${i + 1}\` <@${d.UserId}> - Level: \`${d.UserLevel}\` - XP: \`${d.UserXP}\``)
      .join("\n");

    const embed = new EmbedBuilder()
      .setTitle("Leaderboard")
      .setDescription(mappedData.toString())
      .setColor(interaction.guild?.members?.me?.displayHexColor ?? 0x5865f2);
    interaction.reply({ embeds: [embed] });
  },
  requiredBotPerms: requiredBotPerms,
  requiredUserPerms: requiredUserPerms,
};
