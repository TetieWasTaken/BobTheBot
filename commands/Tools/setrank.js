const { SlashCommandBuilder } = require("@discordjs/builders");
const LevelSchema = require("../../models/LevelModel");
const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");

const requiredBotPerms = {
  type: "flags",
  key: [PermissionFlagsBits.SendMessages],
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setrank")
    .setDescription("Sets the rank of a user")
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("The user to set the rank of")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("rank")
        .setDescription("The rank to set the user to")
        .setRequired(true)
    ),
  async execute(interaction) {
    const user = interaction.options.getUser("target");
    const rank = interaction.options.getInteger("rank");

    if (rank <= 0) {
      return interaction.reply({
        content: ":wrench: You cannot set a user's rank to a negative number!",
        ephemeral: true,
      });
    }

    if (
      !interaction.member.permissions.has(PermissionFlagsBits.Administrator)
    ) {
      return interaction.reply({
        content: ":wrench: You do not have the `ADMINISTRATOR` permission!",
        ephemeral: true,
      });
    }

    const xpForLevel = (desiredRank) => 50 * (desiredRank + 1) ** 2 + 50;

    let data = await LevelSchema.findOneAndUpdate(
      { GuildId: interaction.guild.id, UserId: user.id },
      { UserXP: xpForLevel(rank), UserLevel: rank }
    );
    if (!data) {
      data = new LevelSchema({
        GuildId: interaction.guild.id,
        UserId: user.id,
        UserXP: xpForLevel(rank),
        UserLevel: rank,
      });
      data.save();
    }
    interaction.reply({
      content: `:slot_machine: Set \`${user.tag}\`'s rank to ${rank}!`,
      ephemeral: true,
    });
  },
  requiredBotPerms: requiredBotPerms,
};
