const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

const requiredBotPerms = {
  type: "flags",
  key: [PermissionFlagsBits.ManageMessages],
};

const requiredUserPerms = {
  type: "flags",
  key: [PermissionFlagsBits.ManageMessages],
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("purge")
    .setDescription("Purge a set amount of messages")
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("amount of messages to purge")
        .setRequired(true)
    ),
  async execute(interaction) {
    const amount = interaction.options.getInteger("amount");

    try {
      interaction.channel.bulkDelete(amount).then((messages) =>
        interaction.reply({
          content: `:mag: Purged ${messages.size} messages`,
          ephemeral: true,
        })
      );
    } catch (err) {
      console.log(err);
      return interaction.reply({
        content: "Something went wrong while purging messages",
        ephemeral: true,
      });
    }
  },
  requiredBotPerms: requiredBotPerms,
  requiredUserPerms: requiredUserPerms,
};
