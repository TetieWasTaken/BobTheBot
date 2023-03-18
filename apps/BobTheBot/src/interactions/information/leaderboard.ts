import { EmbedBuilder, type ChatInputCommandInteraction } from "discord.js";
import { Color } from "../../constants.js";
import { LevelModel } from "../../models/index.js";
import { permissionToString, type ChatInputCommand } from "../../utils/index.js";

export const RequiredPerms = {
  bot: [],
  user: [],
} as const;

export const LeaderboardCommand: ChatInputCommand = {
  name: "leaderboard",
  description: "Returns the top 10 users with the most amount of XP in the guild",
  default_member_permissions: permissionToString(RequiredPerms.user),
  dm_permission: false,
} as const;

export async function execute(interaction: ChatInputCommandInteraction<"cached">) {
  const data = await LevelModel.find({ GuildID: interaction.guild.id }).sort({ UserXP: -1 }).limit(10);

  const mappedData = data
    .map((data, index) => `\`${index + 1}\` <@${data.UserId}> - Level: \`${data.UserLevel}\` - XP: \`${data.UserXP}\``)
    .join("\n");

  const embed = new EmbedBuilder()
    .setTitle("Leaderboard")
    .setDescription(mappedData.toString())
    .setColor(interaction.guild?.members?.me?.displayHexColor ?? Color.DiscordPrimary);

  return interaction.reply({ embeds: [embed] });
}
