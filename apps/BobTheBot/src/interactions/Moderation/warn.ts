import { SlashCommandBuilder, PermissionFlagsBits, type ChatInputCommandInteraction } from "discord.js";
import { InfractionsModel } from "../../models/index.js";
import { raiseUserHierarchyError, raiseBotHierarchyError, logger } from "../../utils/index.js";

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
    .setName("warn")
    .setDescription("Warns a user in the current guild")
    .addUserOption((option) => option.setName("target").setDescription("member to warn").setRequired(true))
    .addStringOption((option) =>
      option.setName("reason").setDescription("reason for warn").setMaxLength(255).setRequired(false)
    )
    .setDefaultMemberPermissions(...requiredUserPerms.key)
    .setDMPermission(false),
  async execute(interaction: ChatInputCommandInteraction<"cached">) {
    const user = interaction.options.getUser("target", true);
    const reason = interaction.options.getString("reason") ?? "No reason provided";

    if (!interaction.guild.members.me)
      return interaction.reply({ content: ":x: I am not in this guild!", ephemeral: true });

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
      // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
      const NewCaseId: number = data.Punishments.reduce((a, b) => Math.max(a, b.CaseId), 0) + 1;

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
  },
  requiredBotPerms,
  requiredUserPerms,
};
