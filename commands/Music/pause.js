const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits } = require("discord.js");

const requiredPerms = {
  type: "flags",
  key: PermissionFlagsBits.Connect,
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("pause")
    .setDescription("Toggles the pause state of the player"),
  async execute(interaction) {
    const queue = interaction.client.player.getQueue(interaction.guildId);

    if (!queue) {
      return await interaction.reply({
        content: ":wrench: There is no music playing!",
        ephemeral: true,
      });
    }

    if (queue.connection.paused) {
      await queue.setPaused(false);
      await interaction.reply({
        content: ":play_pause: Resumed the player!",
      });
    } else {
      await queue.setPaused(true);
      await interaction.reply({
        content: ":play_pause: Paused the player!",
      });
    }
  },
  requiredPerms: requiredPerms,
};
