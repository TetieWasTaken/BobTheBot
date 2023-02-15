const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require("discord.js");

module.exports = {
  data: {
    name: "full-setup",
  },
  async execute(interaction) {
    const modal = new ModalBuilder().setCustomId("full-setup-modal").setTitle("Full Setup");

    const logChannelIdInput = new TextInputBuilder()
      .setMaxLength(19)
      .setMinLength(16) // Min length unknown, 16-19?
      .setPlaceholder("1036359877473341563")
      .setRequired(true)
      .setCustomId("logChannelIdInput")
      .setLabel("Enter the channel ID the bot should log to")
      .setStyle(TextInputStyle.Short);

    const firstActionRow = new ActionRowBuilder().addComponents(logChannelIdInput);

    modal.addComponents(firstActionRow);

    await interaction.showModal(modal);
  },
};
