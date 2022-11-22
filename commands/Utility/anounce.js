const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("announce")
    .setDescription("Announce a message to the server")
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("Channel to announce the message in")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("message")
        .setDescription("Message to announce")
        .setRequired(true)
    ),
  async execute(interaction) {
    const channel = interaction.options.getChannel("channel");
    const message = interaction.options.getString("message");

    channel.send(message);

    interaction.reply({
      content: `:white_check_mark: Announced message successfully! <#${channel.id}>`,
      ephemeral: true,
    });
  },
};
