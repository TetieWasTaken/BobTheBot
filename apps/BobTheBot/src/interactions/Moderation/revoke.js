const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const InfractionsSchema = require("../../models/InfractionsModel");

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
    .setName("revoke")
    .setDescription("Revokes a user's infraction")
    .addUserOption((option) => option.setName("target").setDescription("member clear warnings of").setRequired(true))
    .addIntegerOption((option) =>
      option.setName("caseid").setDescription("case id of the warn to clear").setRequired(true)
    ),
  async execute(interaction) {
    const user = interaction.options.getUser("target");
    const caseId = interaction.options.getInteger("caseid");

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
  requiredBotPerms: requiredBotPerms,
  requiredUserPerms: requiredUserPerms,
};
