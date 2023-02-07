const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

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
    .setName("deletegiveaway")
    .setDescription("Deletes a giveaway")
    .addStringOption((option) =>
      option
        .setName("messageid")
        .setDescription("Id of the giveaway that should be deleted")
        .setRequired(true)
    ),
  async execute(interaction) {
    const messageId = interaction.options.getString("messageid");

    interaction.client.giveawaysManager
      .delete(messageId)
      .then(() => {
        interaction.reply({
          content: ":gift: Giveaway deleted successfully",
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
