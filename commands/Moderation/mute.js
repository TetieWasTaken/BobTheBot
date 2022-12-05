const InfractionsSchema = require("../../models/InfractionsModel");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits } = require("discord.js");
const ms = require("ms");

const requiredPerms = {
  type: "flags",
  key: PermissionFlagsBits.ModerateMembers,
};

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
        .setName("duration")
        .setDescription(
          "duration of the mute, in ms format (ex: 1s, 1m, 1h, 1d, 1w)"
        )
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("reason to mute")
        .setMaxLength(255)
        .setRequired(false)
    ),
  async execute(interaction) {
    const member = interaction.options.getMember("target");
    let duration = interaction.options.getString("duration");
    let reason =
      interaction.options.getString("reason") ?? "No reason provided";

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

    const authorMember = await interaction.guild.members.fetch(
      interaction.user.id
    );

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
    if (highestUserRole.position >= authorMember.roles.highest.position) {
      return interaction.reply({
        content: `:wrench: ${member} has a higher or equal role than you on the hierarchy!`,
        ephemeral: true,
      });
    }

    if (member.isCommunicationDisabled()) {
      return interaction.reply({
        content: `:wrench:  \`${member.user.username}#${member.user.discriminator}\` is already muted!`,
        ephemeral: true,
      });
    }

    await member.timeout(ms(duration), reason);

    let data = await InfractionsSchema.findOne({
      GuildId: interaction.guild.id,
      UserId: member.id,
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
        UserId: member.id,
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

    member
      .send(
        `You have been muted in \`${interaction.guild.name}\` for \`${reason}\`\nDuration: \`${duration}\``
      )
      .catch((err) => {
        console.log(err);
      });

    interaction.reply({
      content: `:mute:  \`${member.user.username}#${member.user.discriminator}\` has been muted for \`${reason}\``,
      ephemeral: true,
    });
  },
  requiredPerms: requiredPerms,
};
