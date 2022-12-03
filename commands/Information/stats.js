const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");
const { convertMS } = require("../../functions/convertMS.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("stats")
    .setDescription("Receive statistics about the bot"),
  async execute(interaction) {
    let milliseconds = interaction.client.uptime;

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

    const replyEmbed = new EmbedBuilder()
      .setColor(roleColor)
      .setTitle("Bot Statistics")
      .setDescription("test")
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
};
