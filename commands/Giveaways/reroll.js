const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("reroll")
    .setDescription("Rerolls a giveaway")
    .addStringOption((option) =>
      option
        .setName("messageid")
        .setDescription("The message ID of the giveaway")
        .setRequired(true)
    ),
  async execute(interaction) {
    const messageId = interaction.options.getString("messageid");
    interaction.client.giveawaysManager
      .reroll(messageId)
      .then(() => {
        interaction.reply("Success! Giveaway rerolled!");
      })
      .catch((err) => {
        interaction.reply(
          `An error has occurred, please check and try again.\n\`${err}\``
        );
      });
  },
};
