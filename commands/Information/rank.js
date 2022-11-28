const { SlashCommandBuilder } = require("@discordjs/builders");
const LevelSchema = require("../../models/LevelModel");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("rank")
    .setDescription("Returns xp and rank of given user in the server")
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("User to display rank of")
        .setRequired(false)
    ),
  async execute(interaction) {
    let user = interaction.options.getUser("target") ?? interaction.user;

    let data = await LevelSchema.findOne({
      GuildId: interaction.guild.id,
      UserId: user.id,
    });

    let userXP = 0;

    if (data) {
      userXP = data.UserXP;
    }

    interaction.reply({
      content: `\`${user.username}#${user.discriminator}\` has \`${userXP}\` XP`,
    });
  },
};
