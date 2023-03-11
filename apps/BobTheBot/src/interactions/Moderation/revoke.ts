import { SlashCommandBuilder, PermissionFlagsBits, type ChatInputCommandInteraction } from "discord.js";
import { InfractionsModel } from "../../models/index.js";

const requiredBotPerms = {
  type: "flags" as const,
  key: [] as const,
};

const requiredUserPerms = {
  type: "flags" as const,
  key: [PermissionFlagsBits.ManageMessages] as const,
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("revoke")
    .setDescription("Revokes a user's infraction")
    .addUserOption((option) => option.setName("target").setDescription("member clear warnings of").setRequired(true))
    .addIntegerOption((option) =>
      option.setName("caseid").setDescription("case id of the warn to clear").setRequired(true)
    )
    .setDefaultMemberPermissions(...requiredUserPerms.key)
    .setDMPermission(false),
  async execute(interaction: ChatInputCommandInteraction<"cached">) {
    const user = interaction.options.getUser("target", true);
    const caseId = interaction.options.getInteger("caseid");

    const data = await InfractionsModel.findOneAndUpdate(
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

    return interaction.reply({
      content: `:card_index: Cleared infraction with case id \`${caseId}\``,
      ephemeral: true,
    });
  },
  requiredBotPerms,
  requiredUserPerms,
};
