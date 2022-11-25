const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("slowmode")
    .setDescription("Change the current channel's slowmode")
    .addIntegerOption((option) =>
      option
        .setName("duration")
        .setDescription("duration of the slowmode in seconds (0 to disable)")
        .setRequired(true)
    ),
  async execute(interaction) {
    let duration = interaction.options.getInteger("duration");

    if (
      !interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)
    ) {
      return interaction.reply({
        content: "You do not have the `MANAGE_CHANNELS` permission!",
        ephemeral: true,
      });
    }

    if (duration >= 21601) {
      duration = 21600;
    }

    interaction.channel.setRateLimitPerUser(duration);

    let reply = `:rabbit2: Slowmode has been turned off!`;
    if (duration == 1) {
      reply = `:turtle: Slowmode has been set to ${duration} second!`;
    } else if (duration <= 5 && duration > 1) {
      reply = `:turtle: Slowmode has been set to ${duration} seconds!`;
    } else if (duration >= 6) {
      reply = `:sloth: Slowmode has been set to ${duration} seconds!`;
    }

    interaction.reply({
      content: `${reply}`,
      ephemeral: true,
    });
  },
};
