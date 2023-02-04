const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { convertMS } = require("../../utils/convertMS.js");

const requiredBotPerms = {
  type: "flags",
  key: [],
};

const requiredUserPerms = {
  type: "flags",
  key: [],
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
  requiredBotPerms: requiredBotPerms,
  requiredUserPerms: requiredUserPerms,
};
