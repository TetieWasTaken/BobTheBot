const { SlashCommandBuilder } = require("@discordjs/builders");
const InfractionsSchema = require("../../models/InfractionsModel");
const { EmbedBuilder } = require("discord.js");

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

    let data = await InfractionsSchema.findOne({
      GuildId: interaction.guild.id,
      UserId: user.id,
    });
    if (!data) {
      let newData = new InfractionsSchema({
        GuildId: interaction.guild.id,
        UserId: user.id,
        Punishments: [],
      });
      newData.save();
    }

    let punishmentArray = data.Punishments.map(
      (punishment) => `\`${punishment.PunishType}\`: ${punishment.Reason}`
    );
    const replyEmbed = new EmbedBuilder()
      .setColor(0xffbd67)
      .setTitle(`History for ${user}`)
      .addFields({
        name: `Infractions`,
        value: punishmentArray.join("\n"),
        inline: true,
      })
      .setTimestamp();

    interaction.reply({
      embeds: [replyEmbed],
    });
  },
};
