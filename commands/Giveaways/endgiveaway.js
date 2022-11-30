const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits } = require("discord.js");
const GiveawaySchema = require("../../models/GiveawayModel");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("endgiveaway")
    .setDescription("Ends a giveaway")
    .addStringOption((option) =>
      option
        .setName("messageid")
        .setDescription("Id of the giveaway that should be ended")
        .setRequired(true)
    ),
  async execute(interaction) {
    if (
      !interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)
    ) {
      return interaction.reply({
        content: "You do not have the `MANAGE_MESSAGES` permission!",
        ephemeral: true,
      });
    }

    const messageId = interaction.options.getString("messageid");
    interaction.client.giveawaysManager
      .end(messageId)
      .then(() => {
        GiveawaySchema.deleteOne({ messageId: messageId }).exec();
      })
      .then(() => {
        interaction.reply({
          content: ":gift: Giveaway ended successfully",
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
