const { SlashCommandBuilder } = require("@discordjs/builders");
const { convertMS } = require("../../functions/convertMS.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("uptime")
    .setDescription("Receive the bots's uptime"),
  async execute(interaction) {
    let milliseconds = interaction.client.uptime;

    interaction.reply({
      content: convertMS(milliseconds),
      ephemeral: true,
    });
  },
};
