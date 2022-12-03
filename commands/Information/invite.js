const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("invite")
    .setDescription("Receive an invite link for the bot"),
  async execute(interaction) {
    await interaction.reply({
      content:
        "Here ya go! https://discord.com/api/oauth2/authorize?client_id=1036359071508484237&permissions=8&scope=bot%20applications.commands",
      ephemeral: true,
    });
  },
};
