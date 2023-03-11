import { SlashCommandBuilder, PermissionFlagsBits, type ChatInputCommandInteraction } from "discord.js";
// @ts-expect-error ms package will be fixed in v3.0.0
import ms from "ms";
import { InfractionsModel } from "../../models/index.js";
import { raiseUserHierarchyError, raiseBotHierarchyError, logger } from "../../utils/index.js";

const requiredBotPerms = {
  type: "flags" as const,
  key: [PermissionFlagsBits.ModerateMembers] as const,
};

const requiredUserPerms = {
  type: "flags" as const,
  key: [PermissionFlagsBits.ModerateMembers] as const,
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("mute")
    .setDescription("Puts a user in timeout for a certain amount of time")
    .addUserOption((option) => option.setName("target").setDescription("member to mute").setRequired(true))
    .addStringOption((option) =>
      option
        .setName("duration")
        .setDescription("duration of the mute, in ms format (ex: 1s, 1m, 1h, 1d, 1w)")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("reason").setDescription("reason to mute").setMaxLength(255).setRequired(false)
    )
    .setDefaultMemberPermissions(...requiredUserPerms.key)
    .setDMPermission(false),
  async execute(interaction: ChatInputCommandInteraction<"cached">) {
    const member = interaction.options.getMember("target");
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
      // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
      const NewCaseId: number = data.Punishments.reduce((a, b) => Math.max(a, b.CaseId), 0) + 1;

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
  },
  requiredBotPerms,
  requiredUserPerms,
};
