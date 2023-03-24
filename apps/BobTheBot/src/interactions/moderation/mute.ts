import { ApplicationCommandOptionType, PermissionFlagsBits, type ChatInputCommandInteraction } from "discord.js";
// @ts-expect-error ms package will be fixed in v3.0.0
import ms from "ms";
import { InfractionsModel } from "../../models/index.js";
import {
  permissionToString,
  logger,
  raiseUserHierarchyError,
  raiseBotHierarchyError,
  type ChatInputCommand,
} from "../../utils/index.js";

export const RequiredPerms = {
  bot: [PermissionFlagsBits.ModerateMembers],
  user: [PermissionFlagsBits.ModerateMembers],
} as const;

export const MuteCommand: ChatInputCommand = {
  name: "mute",
  description: "Puts a specific member in a timeout state",
  options: [
    {
      name: "member",
      description: "The member to mute",
      type: ApplicationCommandOptionType.User,
      required: true,
    },
    {
      name: "duration",
      description: "The time to mute the member for",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: "reason",
      description: "The reason for muting the member",
      type: ApplicationCommandOptionType.String,
      required: false,
    },
  ],
  default_member_permissions: permissionToString(RequiredPerms.user),
  dm_permission: false,
} as const;

export async function execute(interaction: ChatInputCommandInteraction<"cached">) {
  const member = interaction.options.getMember("member");
  const duration = interaction.options.getString("duration");
  const reason = interaction.options.getString("reason") ?? "No reason provided";

  if (!member || !interaction.guild.members.me)
    return interaction.reply({ content: "Something went wrong", ephemeral: true });

  const authorMember = await interaction.guild.members.fetch(interaction.user.id);

  const highestUserRole = member.roles.highest;

  if (highestUserRole.position >= authorMember.roles.highest.position) return raiseUserHierarchyError(interaction);

  if (highestUserRole.position >= interaction.guild.members.me.roles.highest.position)
    return raiseBotHierarchyError(interaction);

  if (member.isCommunicationDisabled()) {
    return interaction.reply({
      content: `:wrench:  \`${member.user.tag}\` is already muted!`,
      ephemeral: true,
    });
  }

  try {
    await member.timeout(ms(duration), reason);
  } catch {
    return interaction.reply({
      content: `:wrench:  \`${member.user.tag}\` could not be muted!`,
      ephemeral: true,
    });
  }

  const data = await InfractionsModel.findOne({
    GuildId: interaction.guild.id,
    UserId: member.id,
  });

  if (data) {
    const NewCaseId: number = Number(data.Punishments.reduce((a, b) => Math.max(a, b.CaseId), 0)) + 1;

    data.Punishments.unshift({
      PunishType: "MUTE",
      Reason: reason,
      CaseId: NewCaseId,
    });

    await data.save().catch((error) => logger.error(error));
  } else if (!data) {
    const newData = new InfractionsModel({
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

    await newData.save().catch((error) => logger.error(error));
  }

  await member
    .send(`You have been muted in \`${interaction.guild.name}\` for \`${reason}\`\nDuration: \`${duration}\``)
    .catch(() => {});

  return interaction.reply({
    content: `:mute:  \`${member.user.tag}\` has been muted for \`${reason}\``,
    ephemeral: true,
  });
}
