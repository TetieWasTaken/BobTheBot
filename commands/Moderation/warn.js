const InfractionsSchema = require("../../models/InfractionsModel");
const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");

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
        .setRequired(true)
    )
    .setDMPermission(false),
  async execute(interaction) {
    const user = interaction.options.getUser("target");
    const reason = interaction.options.getString("reason");

    if (
      !interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)
    ) {
      return interaction.reply({
        content: "You do not have the `MANAGE_MESSAGES` permission!",
        ephemeral: true,
      });
    }

    if (
      !interaction.guild.members.me.permissions.has(
        PermissionFlagsBits.ManageMessages
      )
    ) {
      return interaction.reply({
        content: ":wrench: I do not have the `MANAGE_MESSAGES` permission!",
        ephemeral: true,
      });
    }

    let data = await InfractionsSchema.findOne({
      GuildId: interaction.guild.id,
      UserId: user.id,
    });

    if (data) {
      const NewCaseId = data.Punishments.length + 1;

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
      .send(`You have been warned in ${interaction.guild.name} for ${reason}`)
      .catch(console.log);

    interaction.reply({
      content: `:warning:  \`${user.username}#${user.discriminator}\` has been warned for \`${reason}\``,
      ephemeral: true,
    });
  },
};
