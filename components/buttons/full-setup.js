module.exports = {
  data: {
    name: "full-setup",
  },
  async execute(interaction, client) {
    await interaction.reply({
      content: "This is a full setup command",
    });
  },
};
