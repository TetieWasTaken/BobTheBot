const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits } = require("discord.js");

const requiredPerms = {
  type: "flags",
  key: PermissionFlagsBits.Connect,
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("seek")
    .setDescription("Seeks to a specific time in the current track")
    .addIntegerOption((option) =>
      option
        .setName("time")
        .setDescription("The time to seek to, in seconds")
        .setRequired(true)
    ),
  async execute(interaction) {
    const queue = interaction.client.player.getQueue(interaction.guildId);

    if (!queue) {
      return await interaction.reply({
        content: ":wrench: There is no music playing!",
        ephemeral: true,
      });
    }

    const track = queue.current;

    const time = interaction.options.getInteger("time");

    const trackDuration = track.duration.split(":").map((x) => parseInt(x));
    const trackDurationSeconds = trackDuration[0] * 60 + trackDuration[1];

    console.log(trackDurationSeconds + " " + time);

    if (time > trackDurationSeconds) {
      return await interaction.reply({
        content: ":wrench: The time you specified is longer than the track!",
        ephemeral: true,
      });
    }

    await queue.seek(time * 1000);

    await interaction.reply({
      content: `:fast_forward: Seeked to \`${time}\` seconds!`,
    });
  },
  requiredPerms: requiredPerms,
};
