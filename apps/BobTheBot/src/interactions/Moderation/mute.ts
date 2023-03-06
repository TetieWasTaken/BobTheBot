import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction } from "discord.js";
import { InfractionsModel } from "../../models/index.js";
import { raiseUserHierarchyError, raiseBotHierarchyError } from "../../utils/index.js";
const ms = require("ms");

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
    let duration = interaction.options.getString("duration");
    let reason = interaction.options.getString("reason") ?? "No reason provided";

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
    } catch (error) {
      return interaction.reply({
        content: `:wrench:  \`${member.user.tag}\` could not be muted!`,
        ephemeral: true,
      });
    }

    let data = await InfractionsModel.findOne({
      GuildId: interaction.guild.id,
      UserId: member.id,
    });

    if (data) {
      const NewCaseId = data.Punishments.reduce((a, b) => Math.max(a, b.CaseId), 0) + 1;

      data.Punishments.unshift({
        PunishType: "MUTE",
        Reason: reason,
        CaseId: NewCaseId,
      });
      data.save();
    } else if (!data) {
      let newData = new InfractionsModel({
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
      newData.save();
    }

    member
      .send(`You have been muted in \`${interaction.guild.name}\` for \`${reason}\`\nDuration: \`${duration}\``)
      .catch(() => {});

    return interaction.reply({
      content: `:mute:  \`${member.user.tag}\` has been muted for \`${reason}\``,
      ephemeral: true,
    });
  },
  requiredBotPerms: requiredBotPerms,
  requiredUserPerms: requiredUserPerms,
};
