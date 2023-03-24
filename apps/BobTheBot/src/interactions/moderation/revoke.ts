import { ApplicationCommandOptionType, PermissionFlagsBits, type ChatInputCommandInteraction } from "discord.js";
import { InfractionsModel } from "../../models/index.js";
import { permissionToString, type ChatInputCommand } from "../../utils/index.js";

export const RequiredPerms = {
  bot: [],
  user: [PermissionFlagsBits.ManageMessages],
} as const;

export const RevokeCommand: ChatInputCommand = {
  name: "revoke",
  description: "Revoke a user's infraction",
  options: [
    {
      name: "member",
      description: "The member to revoke the infraction from",
      type: ApplicationCommandOptionType.User,
      required: true,
    },
    {
      name: "id",
      description: "The id of the infraction to revoke (/history for ids)",
      type: ApplicationCommandOptionType.Integer,
      required: true,
    },
  ],
  default_member_permissions: permissionToString(RequiredPerms.user),
  dm_permission: false,
} as const;

export async function execute(interaction: ChatInputCommandInteraction<"cached">) {
  const user = interaction.options.getUser("member", true);
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
}
