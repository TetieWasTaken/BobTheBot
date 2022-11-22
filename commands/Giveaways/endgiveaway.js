const { SlashCommandBuilder } = require("@discordjs/builders");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("endgiveaway")
    .setDescription("Ends a giveaway")
    .addStringOption((option) =>
      option
        .setName("messageid")
        .setDescription("Id of the giveaway that should be ended")
        .setRequired(true)
    ),
  async execute(interaction) {
    const messageId = interaction.options.getString("messageid");
    interaction.client.giveawaysManager
      .end(messageId)
      .then(() => {
        interaction.reply("Success! Giveaway ended!");
      })
      .catch((err) => {
        interaction.reply(
          `An error has occurred, please check and try again.\n\`${err}\``
        );
      });
  },
};
