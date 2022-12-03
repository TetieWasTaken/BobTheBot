const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("invite")
    .setDescription("Receive the discord invite link"),
  async execute(interaction) {
    await interaction.reply({
      content: "Here ya go! https://discord.gg/FJ5DMEb8zA",
      ephemeral: true,
    });
  },
};
