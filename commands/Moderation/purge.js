const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("purge")
    .setDescription("Purge a set amount of messages")
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("amount of messages to purge")
        .setRequired(true)
    ),
  async execute(interaction) {
    const amount = interaction.options.getInteger("amount");

    interaction.channel.bulkDelete(amount).then((messages) =>
      interaction.reply({
        content: `Purged ${messages.size} messages`,
      })
    );
  },
};
