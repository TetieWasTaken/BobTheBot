const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits } = require("discord.js");
const {
  raiseUserPermissionsError,
  raiseBotPermissionsError,
} = require("../../utils/returnError.js");

const requiredBotPerms = {
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

    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages))
      return raiseUserPermissionsError(interaction, "MANAGE_MESSAGES");

    if (
      !interaction.guild.members.me.permissions.has(
        PermissionFlagsBits.ManageMessages
      )
    )
      return raiseBotPermissionsError(interaction, "MANAGE_MESSAGES");

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
};
