const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits } = require("discord.js");

const requiredPerms = {
  type: "flags",
  key: PermissionFlagsBits.ManageMessages,
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

    if (
      !interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)
    ) {
      return interaction.reply({
        content: "You do not have the `MANAGE_MESSAGES` permission!",
        ephemeral: true,
      });
    }

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
  requiredPerms: requiredPerms,
};
