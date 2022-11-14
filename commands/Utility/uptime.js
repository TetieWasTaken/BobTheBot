const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("uptime")
    .setDescription("Receive the bots's uptime"),
  async execute(interaction) {
    const sent = await interaction.reply({
      content: "Pinging...",
      fetchReply: true,
    });
    await interaction.editReply(
      `Uptime: \`${Math.round(interaction.client.uptime / 60000)} minutes\``
    );
  },
};
