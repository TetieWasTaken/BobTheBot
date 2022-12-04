const { SlashCommandBuilder } = require("@discordjs/builders");
const InfractionsSchema = require("../../models/InfractionsModel");
const { PermissionFlagsBits } = require("discord.js");

const requiredPerms = {
  type: "flags",
  key: PermissionFlagsBits.SendMessages,
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("revoke")
    .setDescription("Revokes a user's infraction")
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("member clear warnings of")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("caseid")
        .setDescription("case id of the warn to clear")
        .setRequired(true)
    ),
  async execute(interaction) {
    const user = interaction.options.getUser("target");
    const caseId = interaction.options.getInteger("caseid");

    if (
      !interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)
    ) {
      return interaction.reply({
        content: "You do not have the `MANAGE_MESSAGES` permission!",
        ephemeral: true,
      });
    }

    let data = await InfractionsSchema.findOneAndUpdate(
      {
        "GuildId": interaction.guild.id,
        "UserId": user.id,
        "Punishments.CaseId": caseId,
      },
      { $pull: { Punishments: { CaseId: caseId } } }
    );

    if (!data) {
      return interaction.reply({
        content: "Could not find infraction with this ID",
        ephemeral: true,
      });
    }

    interaction.reply({
      content: `:card_index: Cleared infraction with case id \`${caseId}\``,
      ephemeral: true,
    });
  },
  requiredPerms: requiredPerms,
};
