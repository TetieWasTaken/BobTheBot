const { SlashCommandBuilder } = require("@discordjs/builders");
const InfractionsSchema = require("../../models/InfractionsModel");
const { EmbedBuilder, PermissionFlagsBits, time } = require("discord.js");
const { roleColor } = require("../../functions/roleColor.js");

const requiredPerms = {
  type: "flags",
  key: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks],
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("history")
    .setDescription("Check a user's infraction history")
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("member to view history of")
        .setRequired(true)
    ),
  async execute(interaction) {
    const member = interaction.options.getMember("target");

    if (
      !interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)
    ) {
      return interaction.reply({
        content: "You do not have the `MANAGE_MESSAGES` permission!",
        ephemeral: true,
      });
    }

    let data = await InfractionsSchema.findOne({
      GuildId: interaction.guild.id,
      UserId: member.id,
    });
    if (!data) {
      data = new InfractionsSchema({
        GuildId: interaction.guild.id,
        UserId: member.id,
        Punishments: [],
      });
      data.save();
    }

    let isCommunicationDisabledBool = false;
    if (member.isCommunicationDisabled() == true) {
      isCommunicationDisabledBool = true;
    }

    let punishmentArray = ["No active infractions."];

    if (data) {
      punishmentArray = data.Punishments.map(
        (punishment) =>
          `\`ID\`: ${punishment.CaseId}, \`${punishment.PunishType}\`: ${punishment.Reason}`
      );
      if (punishmentArray.length == 0) {
        punishmentArray.push("No active infractions.");
      } else if (punishmentArray.length >= 20) {
        punishmentArray = punishmentArray.slice(0, 20);
        punishmentArray.push("+ more");
      }
    }

    const replyEmbed = new EmbedBuilder()
      .setColor(roleColor(interaction))
      .setTitle(`History for ${member.displayName}`)
      .addFields(
        {
          name: `Infractions`,
          value: punishmentArray.join("\n"),
          inline: true,
        },
        {
          name: `Active infraction`,
          value: `This member is timed out until: ${time(
            member.communicationDisabledUntil,
            "f"
          )}`,
          inline: false,
        }
      )
      .setTimestamp();

    if (!isCommunicationDisabledBool) {
      replyEmbed.spliceFields(-1, 1);
    }

    interaction.reply({
      embeds: [replyEmbed],
    });
  },
  requiredPerms: requiredPerms,
};
