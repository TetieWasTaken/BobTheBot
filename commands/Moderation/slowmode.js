const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits } = require("discord.js");
const {
  raiseUserPermissionsError,
  raiseBotPermissionsError,
} = require("../../utils/returnError.js");

const requiredBotPerms = {
  type: "flags",
  key: [PermissionFlagsBits.ManageChannels],
};

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

    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels))
      return raiseUserPermissionsError(interaction, "MANAGE_CHANNELS");

    if (
      !interaction.guild.members.me.permissions.has(
        PermissionFlagsBits.ManageChannels
      )
    )
      return raiseBotPermissionsError(interaction, "MANAGE_CHANNELS");

    if (duration >= 21601) {
      duration = 21600;
    }

    try {
      interaction.channel.setRateLimitPerUser(duration);
    } catch (err) {
      console.log(err);
      return interaction.reply({
        content:
          "Something went wrong while setting the slowmode, please report this!",
        ephemeral: true,
      });
    }

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
  requiredBotPerms: requiredBotPerms,
};
