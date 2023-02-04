const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const EconomySchema = require("../../models/EconomyModel");

const requiredBotPerms = {
  type: "flags",
  key: [PermissionFlagsBits.EmbedLinks],
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("rankings")
    .setDescription("Shows the top 10 richest people!"),
  async execute(interaction) {
    const data = await EconomySchema.find().sort({ NetWorth: -1 }).limit(10);
    data.sort((a, b) => b.NetWorth - a.NetWorth);

    const embed = new EmbedBuilder()
      .setTitle("Leaderboard")
      .setColor(0x00ff00)
      .setFooter({
        text: `Requested by ${interaction.user.tag}`,
        iconURL: `${interaction.user.displayAvatarURL({ dynamic: true })}`,
      });

    for (let i = 0; i < data.length; i++) {
      const user = await interaction.client.users.fetch(data[i].UserId);
      embed.addFields({
        name: `${i + 1}. ${user.tag}`,
        value: `**Net Worth:** ${data[i].NetWorth}\n**Wallet:** ${data[i].Wallet}\n**Bank:** ${data[i].Bank}`,
        inline: false,
      });
    }
    await interaction.reply({ embeds: [embed] });
  },
  requiredBotPerms: requiredBotPerms,
};
