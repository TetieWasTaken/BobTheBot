const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Get help from the bot"),
  async execute(interaction) {
    const userDM = new EmbedBuilder()
      .setColor(0xffbd67)
      .setTitle(`Bob's heldesk`)
      .addFields(
        {
          name: `Commands`,
          value: `:one:`,
          inline: true,
        },
        { name: `Social links`, value: `:two:`, inline: true }
      )
      .setTimestamp();

    interaction.user
      .createDM(true)
      .catch((err) =>
        interaction.reply({ content: `An error occured: \`${err}\`` })
      );
    interaction.user
      .send({ embeds: [userDM] })
      .catch((err) =>
        interaction.reply({ content: `An error occured: \`${err}\`` })
      );
    interaction.reply({
      content: `Please check your Direct Messages!`,
      ephemeral: true,
    });
  },
};
