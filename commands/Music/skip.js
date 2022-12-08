const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits } = require("discord.js");

const requiredPerms = {
  type: "flags",
  key: PermissionFlagsBits.Connect,
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Skips the current song"),
  async execute(interaction) {
    if (
      !interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)
    ) {
      return await interaction.reply({
        content:
          ":wrench: You need the `MANAGE_MESSAGES` permission to use this command!",
        ephemeral: true,
      });
    }

    const queue = interaction.client.player.getQueue(interaction.guildId);

    if (!queue) {
      return await interaction.reply({
        content: ":wrench: There is no music playing!",
        ephemeral: true,
      });
    }

    const currentTrack = queue.current;
    const success = queue.skip();

    await interaction.reply({
      content: success
        ? `:track_next: Skipped **${currentTrack.title}**!`
        : ":wrench: Something went wrong!",
      ephemeral: true,
    });
  },
  requiredPerms: requiredPerms,
};
