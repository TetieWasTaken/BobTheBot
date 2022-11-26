const InfractionsSchema = require("../../models/InfractionsModel");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("mute")
    .setDescription("Puts a user in timeout for a certain amount of time")
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("member to mute")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("reason to mute")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("duration")
        .setDescription(
          "duration of the mute in hours (default set to 12 hours)"
        )
        .setAutocomplete(true)
        .setRequired(false)
    ),
  async execute(interaction) {
    const user = interaction.options.getUser("target");
    const reason = interaction.options.getString("reason");
    let duration = interaction.options.getInteger("duration");

    if (
      !interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)
    ) {
      return interaction.reply({
        content: "You do not have the `MODERATE_MEMBERS` permission!",
        ephemeral: true,
      });
    }

    if (
      !interaction.guild.members.me.permissions.has(
        PermissionFlagsBits.ModerateMembers
      )
    ) {
      return interaction.reply({
        content: ":wrench: I do not have the `MODERATE_MEMBERS` permission!",
        ephemeral: true,
      });
    }

    if (duration === null) {
      duration = 12;
    }

    const member = await interaction.guild.members.fetch(user.id);

    const highestUserRole = member.roles.highest;
    if (
      highestUserRole.position >=
      interaction.guild.members.me.roles.highest.position
    ) {
      return interaction.reply({
        content: `:wrench: Please make sure my role is above the ${highestUserRole} role!`,
        ephemeral: true,
      });
    }

    await member.timeout(duration * 60 * 1000 * 60, reason);

    let data = await InfractionsSchema.findOne({
      GuildId: interaction.guild.id,
      UserId: user.id,
    });

    if (data) {
      const NewCaseId = data.Punishments.length + 1;

      data.Punishments.unshift({
        PunishType: "MUTE",
        Reason: reason,
        CaseId: NewCaseId,
      });
      data.save();
    } else if (!data) {
      let newData = new InfractionsSchema({
        GuildId: interaction.guild.id,
        UserId: user.id,
        Punishments: [
          {
            PunishType: "MUTE",
            Reason: reason,
            CaseId: 1,
          },
        ],
      });
      newData.save();
    }

    interaction.reply({
      content: `:mute:  \`${user.username}#${user.discriminator}\` has been muted for \`${reason}\``,
      ephemeral: true,
    });
  },
};
