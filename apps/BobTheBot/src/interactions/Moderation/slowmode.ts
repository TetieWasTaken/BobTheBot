import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction } from "discord.js";

const requiredBotPerms = {
  type: "flags" as const,
  key: [PermissionFlagsBits.ManageChannels] as const,
};

const requiredUserPerms = {
  type: "flags" as const,
  key: [PermissionFlagsBits.ManageChannels] as const,
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("slowmode")
    .setDescription("Change the current channel's slowmode")
    .addIntegerOption((option) =>
      option.setName("duration").setDescription("duration of the slowmode in seconds (0 to disable)").setRequired(true)
    )
    .setDefaultMemberPermissions(...requiredUserPerms.key),
  async execute(interaction: ChatInputCommandInteraction<"cached">) {
    let duration = interaction.options.getInteger("duration", true);

    if (!interaction.channel) return interaction.reply({ content: "Something went wrong", ephemeral: true });

    if (duration >= 21601) {
      duration = 21600;
    }

    try {
      interaction.channel.setRateLimitPerUser(duration);
    } catch (err) {
      console.log(err);
      return interaction.reply({
        content: "Something went wrong while setting the slowmode, please report this!",
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

    return interaction.reply({
      content: `${reply}`,
      ephemeral: true,
    });
  },
  requiredBotPerms: requiredBotPerms,
  requiredUserPerms: requiredUserPerms,
};
