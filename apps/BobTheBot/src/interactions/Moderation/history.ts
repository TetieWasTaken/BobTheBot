import {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  time,
  type ChatInputCommandInteraction,
} from "discord.js";
import { Color } from "../../constants.js";
import { InfractionsModel } from "../../models/index.js";
import { logger } from "../../utils/index.js";

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
    .setName("history")
    .setDescription("Check a user's infraction history")
    .addUserOption((option) => option.setName("target").setDescription("member to view history of").setRequired(true))
    .setDefaultMemberPermissions(...requiredUserPerms.key)
    .setDMPermission(false),
  async execute(interaction: ChatInputCommandInteraction<"cached">) {
    const member = interaction.options.getMember("target");

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
        value: `This member is timed out until: ${time(member.communicationDisabledUntil, "f")}`,
        inline: false,
      });
    }

    return interaction.reply({
      embeds: [replyEmbed],
    });
  },
  requiredBotPerms,
  requiredUserPerms,
};
