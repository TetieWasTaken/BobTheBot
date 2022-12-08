const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits } = require("discord.js");

const requiredPerms = {
  type: "flags",
  key: PermissionFlagsBits.Connect,
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("loop")
    .setDescription("Loops the current track or queue")
    .addStringOption((option) =>
      option
        .setName("type")
        .setDescription("The type of loop to use")
        .setRequired(true)
        .addChoices(
          { name: "Off", value: "Off" },
          { name: "Track", value: "Track" },
          { name: "Queue", value: "Queue" }
        )
    ),
  async execute(interaction) {
    const queue = interaction.client.player.getQueue(interaction.guildId);

    if (!queue) {
      return await interaction.reply({
        content: ":wrench: There is no music playing!",
        ephemeral: true,
      });
    }

    const loopType = interaction.options.getString("type");

    switch (loopType) {
      case "Off":
        await queue.setRepeatMode(0);
        await interaction.reply({
          content: ":repeat: Disabled looping!",
        });
        break;
      case "Track":
        await queue.setRepeatMode(1);
        await interaction.reply({
          content: ":repeat: Enabled track looping!",
        });
        break;
      case "Queue":
        await queue.setRepeatMode(2);
        await interaction.reply({
          content: ":repeat: Enabled queue looping!",
        });
        break;
      default:
        await interaction.reply({
          content: ":wrench: Something went wrong!",
          ephemeral: true,
        });
        break;
    }
  },
  requiredPerms: requiredPerms,
};
