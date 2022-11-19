module.exports = {
  name: "interactionCreate",
  once: false,
  async execute(interaction) {
    if (interaction.isButton()) {
      console.log("isButton interaction");
      const button = interaction.client.buttons.get(interaction.customId);
      console.log(button);
      if (!button) return new Error("No code for button!");

      try {
        console.log("trying button...");
        await button.execute(interaction);
      } catch (err) {
        console.log(err);
      }
    }
    if (!interaction.isCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (err) {
      if (err) console.error(err);
      await interaction.reply({
        content: "An error occured while executing that command.",
        ephemeral: true,
      });
    }
  },
};
