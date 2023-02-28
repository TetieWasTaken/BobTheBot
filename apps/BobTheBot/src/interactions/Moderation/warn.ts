import { InfractionsModel } from "../../models/index.js";
import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction } from "discord.js";
import { raiseUserHierarchyError, raiseBotHierarchyError } from "../../utils/index.js";

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
    .setDMPermission(false),
  async execute(interaction: ChatInputCommandInteraction<"cached">) {
    const user = interaction.options.getUser("target", true);
    let reason = interaction.options.getString("reason") ?? "No reason provided";

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

    let data = await InfractionsModel.findOne({
      GuildId: interaction.guild.id,
      UserId: user.id,
    });

    if (data) {
      const NewCaseId = data.Punishments.reduce((a, b) => Math.max(a, b.CaseId), 0) + 1;

      data.Punishments.unshift({
        PunishType: "WARN",
        Reason: reason,
        CaseId: NewCaseId,
      });
      data.save();
    } else if (!data) {
      let newData = new InfractionsModel({
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
      .send(`You have been warned in \`${interaction.guild.name}\` for \`${reason}\``)
      .catch(() => {})
      .then(() => {
        return interaction.reply({
          content: `:warning:  \`${user.tag}\` has been warned for \`${reason}\``,
          ephemeral: true,
        });
      });

    return;
  },
  requiredBotPerms: requiredBotPerms,
  requiredUserPerms: requiredUserPerms,
};
