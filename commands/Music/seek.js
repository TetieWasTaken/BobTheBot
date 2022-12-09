const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits } = require("discord.js");

const requiredPerms = {
  type: "flags",
  key: [
    PermissionFlagsBits.Connect,
    PermissionFlagsBits.Speak,
    PermissionFlagsBits.SendMessages,
  ],
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
    const DJRole = interaction.guild.roles.cache.find((role) =>
      ["DJ", "dj", "Dj", "dJ"].includes(role.name)
    );

    if (
      interaction.member.permissions.has(PermissionFlagsBits.ManageMessages) ||
      interaction.member.roles.cache.has(DJRole.id)
    ) {
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
    } else if (DJRole) {
      await interaction.reply({
        content:
          "You do not have the permission to use this command. You need the `DJ` role or the MANAGE_MESSAGES permission!",
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content:
          "You do not have the permission to use this command. You need the MANAGE_MESSAGES permission or a role named `DJ`!",
        ephemeral: true,
      });
    }
  },
  requiredPerms: requiredPerms,
};
