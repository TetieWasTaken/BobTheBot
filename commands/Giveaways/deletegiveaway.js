const { SlashCommandBuilder } = require("@discordjs/builders");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("deletegiveaway")
    .setDescription("Deletes a giveaway")
    .addStringOption((option) =>
      option
        .setName("messageid")
        .setDescription("Id of the giveaway that should be deleted")
        .setRequired(true)
    ),
  async execute(interaction) {
    const messageId = interaction.options.getString("messageid");
    interaction.client.giveawaysManager
      .delete(messageId)
      .then(() => {
        interaction.reply("Success! Giveaway deleted!");
      })
      .catch((err) => {
        interaction.reply(
          `An error has occurred, please check and try again.\n\`${err}\``
        );
      });
  },
};
