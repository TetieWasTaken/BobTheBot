const { SlashCommandBuilder } = require("@discordjs/builders");
const InfractionsSchema = require("../../models/InfractionsModel");
const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");

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
    const user = interaction.options.getUser("target");

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
      UserId: user.id,
    });
    if (!data) {
      data = new InfractionsSchema({
        GuildId: interaction.guild.id,
        UserId: user.id,
        Punishments: [],
      });
      data.save();
    }

    const member = await interaction.guild.members.fetch(user.id);
    let isCommunicationDisabledBool = false;
    if (member.isCommunicationDisabled() == true) {
      isCommunicationDisabledBool = true;
    }

    let punishmentArray = data.Punishments.map(
      (punishment) =>
        `\`ID\`: ${punishment.CaseId}, \`${punishment.PunishType}\`: ${punishment.Reason}`
    );
    if (punishmentArray.length == 0) {
      punishmentArray.push("No active infractions.");
    }

    const replyEmbed = new EmbedBuilder()
      .setColor(0xffffff)
      .setTitle(`History for ${user.username}`)
      .addFields({
        name: `Infractions`,
        value: punishmentArray.join("\n"),
        inline: true,
      })
      .addFields({
        name: `Active infraction`,
        value: `This user is timed out until: ${member.communicationDisabledUntil}`,
        inline: false,
      })
      .setTimestamp();

    if (!isCommunicationDisabledBool) {
      replyEmbed.spliceFields(-1, 1);
    }

    interaction.reply({
      embeds: [replyEmbed],
    });
  },
};
