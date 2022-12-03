const { SlashCommandBuilder } = require("@discordjs/builders");
const LevelSchema = require("../../models/LevelModel");
const { EmbedBuilder } = require("discord.js");

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

    let roleColor = "ffffff";
    const botMember = interaction.guild.members.cache.get(
      interaction.client.user.id
    );
    const roleCacheSize = botMember.roles.cache.size;
    if (roleCacheSize >= 2) {
      if (botMember.roles.color !== null) {
        roleColor = botMember.roles.color.hexColor;
      }
    }

    const embed = new EmbedBuilder()
      .setTitle("Leaderboard")
      .setDescription(mappedData.toString())
      .setColor(roleColor);
    interaction.reply({ embeds: [embed] });
  },
};
