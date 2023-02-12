const InfractionsSchema = require("../../models/InfractionsModel");
const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const {
  raiseUserHierarchyError,
  raiseBotHierarchyError,
} = require("../../utils/returnError.js");

const requiredBotPerms = {
  type: "flags",
  key: [],
};

const requiredUserPerms = {
  type: "flags",
  key: [PermissionFlagsBits.ManageMessages],
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Warns a user in the current guild")
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("member to warn")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("reason for warn")
        .setMaxLength(255)
        .setRequired(false)
    )
    .setDMPermission(false),
  async execute(interaction) {
    const user = interaction.options.getUser("target");
    let reason =
      interaction.options.getString("reason") ?? "No reason provided";

    if (user.bot) {
      return interaction.reply({
        content: ":wrench: You can't warn bots!",
        ephemeral: true,
      });
    }
    if (user.id === interaction.user.id) {
      return interaction.reply({
        content: ":wrench: You can't warn yourself!",
        ephemeral: true,
      });
    }

    const member = await interaction.guild.members.fetch(user.id);
    const authorMember = await interaction.guild.members.fetch(
      interaction.user.id
    );

    const highestUserRole = member.roles.highest;
    if (
      highestUserRole.position >=
      interaction.guild.members.me.roles.highest.position
    )
      return raiseBotHierarchyError(interaction);

    if (highestUserRole.position >= authorMember.roles.highest.position)
      return raiseUserHierarchyError(interaction);

    let data = await InfractionsSchema.findOne({
      GuildId: interaction.guild.id,
      UserId: user.id,
    });

    if (data) {
      const NewCaseId =
        data.Punishments.reduce((a, b) => Math.max(a, b.CaseId), 0) + 1;

      data.Punishments.unshift({
        PunishType: "WARN",
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
            PunishType: "WARN",
            Reason: reason,
            CaseId: 1,
          },
        ],
      });
      newData.save();
    }

    user
      .send(
        `You have been warned in \`${interaction.guild.name}\` for \`${reason}\``
      )
      .catch((err) => {
        console.log(err);
      });

    interaction.reply({
      content: `:warning:  \`${user.username}#${user.discriminator}\` has been warned for \`${reason}\``,
      ephemeral: true,
    });
  },
  requiredBotPerms: requiredBotPerms,
  requiredUserPerms: requiredUserPerms,
};
