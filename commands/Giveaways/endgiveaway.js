const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const GiveawaySchema = require("../../models/GiveawayModel");

const requiredBotPerms = {
  type: "flags",
  key: [],
};

const requiredUserPerms = {
  type: "flags",
  key: [PermissionFlagsBits.Administrator],
};

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
        console.log(err);
        interaction.reply({
          content: `An error has occurred, please check and try again.`,
        });
      });
  },
  requiredBotPerms: requiredBotPerms,
  requiredUserPerms: requiredUserPerms,
};
