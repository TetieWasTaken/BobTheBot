import {
  ApplicationCommandOptionType,
  PermissionFlagsBits,
  EmbedBuilder,
  type ChatInputCommandInteraction,
} from "discord.js";
import { Color } from "../../constants.js";
import { InfractionsModel } from "../../models/index.js";
import { logger, permissionToString, type ChatInputCommand } from "../../utils/index.js";

export const RequiredPerms = {
  bot: [],
  user: [PermissionFlagsBits.SendMessages],
} as const;

export const HistoryCommand: ChatInputCommand = {
  name: "history",
  description: "View a user's history",
  options: [
    {
      name: "user",
      description: "The user to target",
      type: ApplicationCommandOptionType.User,
      required: true,
    },
  ],
  default_member_permissions: permissionToString(RequiredPerms.user),
  dm_permission: false,
} as const;

export async function execute(interaction: ChatInputCommandInteraction<"cached">) {
  const member = interaction.options.getMember("user");

  if (!member) return interaction.reply({ content: "Something went wrong", ephemeral: true });

  let data = await InfractionsModel.findOne({
    GuildId: interaction.guild.id,
    UserId: member.id,
  });
  if (!data) {
    data = new InfractionsModel({
      GuildId: interaction.guild.id,
      UserId: member.id,
      Punishments: [],
    });

    await data.save().catch((error) => logger.error(error));
  }

  let punishmentArray = ["No active infractions."];

  if (data) {
    punishmentArray = data.Punishments.map(
      (punishment) => `\`ID\`: ${punishment.CaseId}, \`${punishment.PunishType}\`: ${punishment.Reason}`
    );
    if (punishmentArray.length === 0) {
      punishmentArray.push("No active infractions.");
    } else if (punishmentArray.length >= 20) {
      punishmentArray = punishmentArray.slice(0, 20);
      punishmentArray.push("+ more");
    }
  }

  const replyEmbed = new EmbedBuilder()
    .setColor(interaction.guild.members?.me?.displayHexColor ?? Color.DiscordPrimary)
    .setTitle(`History for ${member.displayName}`)
    .addFields({
      name: `Infractions`,
      value: punishmentArray.join("\n"),
      inline: true,
    })
    .setTimestamp();

  if (member.communicationDisabledUntil) {
    replyEmbed.addFields({
      name: `Active infraction`,
      value: `This member is timed out until: <t:${member.communicationDisabledUntilTimestamp}:f>`,
      inline: false,
    });
  }

  return interaction.reply({
    embeds: [replyEmbed],
  });
}
