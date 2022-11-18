const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("uptime")
    .setDescription("Receive the bots's uptime"),
  async execute(interaction) {
    let milliseconds = interaction.client.uptime;

    function padTo2Digits(num) {
      return num.toString().padStart(2, "0");
    }

    function convertMS(milliseconds) {
      let seconds = Math.floor(milliseconds / 1000);
      let minutes = Math.floor(seconds / 60);
      let hours = Math.floor(minutes / 60);

      seconds = seconds % 60;
      minutes = minutes % 60;
      hours = hours % 24;

      return `:stopwatch: Uptime: \`${padTo2Digits(
        hours
      )}\` hours, \`${padTo2Digits(minutes)}\` minutes, \`${padTo2Digits(
        seconds
      )}\` seconds`;
    }

    interaction.reply({
      content: convertMS(milliseconds),
    });
  },
};
