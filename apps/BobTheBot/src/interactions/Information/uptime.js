const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
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
  data: new SlashCommandBuilder().setName("uptime").setDescription("Receive the bots's uptime"),
  async execute(interaction) {
    let milliseconds = interaction.client.uptime;

    const embed = new EmbedBuilder()
      .setTitle("⏱️ Uptime")
      .setDescription(`${convertMS(milliseconds)}`)
      .setColor(interaction.guild.members.me.displayHexColor)
      .setFooter({ text: `${milliseconds}ms` });

    return await interaction.reply({ embeds: [embed] });
  },
  requiredBotPerms: requiredBotPerms,
  requiredUserPerms: requiredUserPerms,
};
