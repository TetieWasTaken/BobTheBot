const { SlashCommandBuilder } = require("@discordjs/builders");
const LevelSchema = require("../../models/LevelModel");
const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const { roleColor } = require("../../utils/roleColor.js");

const requiredBotPerms = {
  type: "flags",
  key: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks],
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("Returns the top 10 users with the most amount of XP"),
  async execute(interaction) {
    const data = await LevelSchema.find({ GuildID: interaction.guild.id })
      .sort({ UserXP: -1 })
      .limit(10);

    const mappedData = data
      .map(
        (d, i) =>
          `\`${i + 1}\` <@${d.UserId}> - Level: \`${d.UserLevel}\` - XP: \`${
            d.UserXP
          }\``
      )
      .join("\n");

    const embed = new EmbedBuilder()
      .setTitle("Leaderboard")
      .setDescription(mappedData.toString())
      .setColor(roleColor(interaction));
    interaction.reply({ embeds: [embed] });
  },
  requiredBotPerms: requiredBotPerms,
};
