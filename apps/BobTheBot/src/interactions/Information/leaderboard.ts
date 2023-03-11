import { SlashCommandBuilder, EmbedBuilder, type ChatInputCommandInteraction } from "discord.js";
import { Color } from "../../constants.js";
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
    .setDescription("Returns the top 10 users with the most amount of XP")
    .setDMPermission(true),
  async execute(interaction: ChatInputCommandInteraction<"cached">) {
    const data = await LevelModel.find({ GuildID: interaction.guild.id }).sort({ UserXP: -1 }).limit(10);

    const mappedData = data
      .map(
        (data, index) => `\`${index + 1}\` <@${data.UserId}> - Level: \`${data.UserLevel}\` - XP: \`${data.UserXP}\``
      )
      .join("\n");

    const embed = new EmbedBuilder()
      .setTitle("Leaderboard")
      .setDescription(mappedData.toString())
      .setColor(interaction.guild?.members?.me?.displayHexColor ?? Color.DiscordPrimary);

    return interaction.reply({ embeds: [embed] });
  },
  requiredBotPerms,
  requiredUserPerms,
};
