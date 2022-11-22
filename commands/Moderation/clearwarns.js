const { SlashCommandBuilder } = require("@discordjs/builders");
const InfractionsSchema = require("../../models/InfractionsModel");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("clearwarns")
    .setDescription("Clears warnings of a user")
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("member clear warnings of")
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
      });
      newData.save();
      interaction.reply({ content: `Specified user has no active warnings.` });
    } else if (data) {
      await InfractionsSchema.findOneAndUpdate(
        {
          GuildId: interaction.guild.id,
          UserId: user.id,
        },
        {
          Punishments: [],
        }
      );
    }
  },
};
