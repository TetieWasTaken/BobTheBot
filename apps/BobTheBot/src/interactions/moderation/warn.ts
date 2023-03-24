import { PermissionFlagsBits, ApplicationCommandOptionType, type ChatInputCommandInteraction } from "discord.js";
import { InfractionsModel } from "../../models/index.js";
import {
  permissionToString,
  raiseUserHierarchyError,
  raiseBotHierarchyError,
  logger,
  type ChatInputCommand,
} from "../../utils/index.js";

export const RequiredPerms = {
  bot: [],
  user: [PermissionFlagsBits.ManageMessages],
} as const;

export const WarnCommand: ChatInputCommand = {
  name: "warn",
  description: "Warn a member in the guild",
  options: [
    {
      name: "member",
      description: "The member to warn",
      type: ApplicationCommandOptionType.User,
      required: true,
    },
    {
      name: "reason",
      description: "The reason for warning the user",
      type: ApplicationCommandOptionType.String,
      required: false,
    },
  ],
  default_member_permissions: permissionToString(RequiredPerms.user),
  dm_permission: false,
} as const;

export async function execute(interaction: ChatInputCommandInteraction<"cached">) {
  const user = interaction.options.getUser("member", true);
  const reason = interaction.options.getString("reason") ?? "No reason provided";

  if (!interaction.guild.members.me)
    return interaction.reply({ content: "❌ I am not in this guild!", ephemeral: true });

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
  const authorMember = await interaction.guild.members.fetch(interaction.user.id);

  const highestUserRole = member.roles.highest;
  if (highestUserRole.position >= interaction.guild.members.me.roles.highest.position)
    return raiseBotHierarchyError(interaction);

  if (highestUserRole.position >= authorMember.roles.highest.position) return raiseUserHierarchyError(interaction);

  const data = await InfractionsModel.findOne({
    GuildId: interaction.guild.id,
    UserId: user.id,
  });

  if (data) {
    const NewCaseId: number = Number(data.Punishments.reduce((a, b) => Math.max(a, b.CaseId), 0)) + 1;

    data.Punishments.unshift({
      PunishType: "WARN",
      Reason: reason,
      CaseId: NewCaseId,
    });

    await data.save().catch((error) => logger.error(error));
  } else if (!data) {
    const newData = new InfractionsModel({
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

    await newData.save().catch((error) => logger.error(error));
  }

  await user
    .send(`You have been warned in \`${interaction.guild.name}\` for \`${reason}\``)
    .catch(() => {})
    .then(async () => {
      return interaction.reply({
        content: `:warning:  \`${user.tag}\` has been warned for \`${reason}\``,
        ephemeral: true,
      });
    });
}
