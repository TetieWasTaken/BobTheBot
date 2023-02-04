const { SlashCommandBuilder } = require("@discordjs/builders");
const { convertMS } = require("../../utils/convertMS.js");
const { PermissionFlagsBits } = require("discord.js");

const requiredPerms = {
  type: "flags",
  key: [PermissionFlagsBits.SendMessages],
};

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
  requiredPerms: requiredPerms,
};
