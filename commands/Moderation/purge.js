const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits } = require("discord.js");
const wait = require("node:timers/promises").setTimeout;

const requiredPerms = {
  type: "flags",
  key: [PermissionFlagsBits.ManageMessages, PermissionFlagsBits.SendMessages],
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

    if (
      !interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)
    ) {
      return interaction.reply({
        content: "You do not have the `MANAGE_MESSAGES` permission!",
        ephemeral: true,
      });
    }

    if (
      !interaction.guild.members.me.permissions.has(
        PermissionFlagsBits.ManageMessages
      )
    ) {
      return interaction.reply({
        content: ":wrench: I do not have the `MANAGE_MESSAGES` permission!",
        ephemeral: true,
      });
    }

    interaction.channel.bulkDelete(amount).then((messages) =>
      interaction.reply({
        content: `:mag: Purged ${messages.size} messages`,
      })
    );
    await wait(1500);
    interaction.deleteReply();
  },
  requiredPerms: requiredPerms,
};
