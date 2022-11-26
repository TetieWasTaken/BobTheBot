const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits } = require("discord.js");

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

    if (
      !interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)
    ) {
      return interaction.reply({
        content: "You do not have the `MANAGE_MESSAGES` permission!",
        ephemeral: true,
      });
    }

    interaction.client.giveawaysManager
      .reroll(messageId)
      .then(() => {
        interaction.reply({
          content: ":gift: Giveaway rerolled successfully",
          ephemeral: true,
        });
      })
      .catch((err) => {
        interaction.reply(
          `An error has occurred, please check and try again.\n\`${err}\``
        );
      });
  },
};
