const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits } = require("discord.js");
const EconomySchema = require("../../models/EconomyModel");

const requiredPerms = {
  type: "flags",
  key: [PermissionFlagsBits.SendMessages],
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("deposit")
    .setDescription("Deposit money from your wallet into your bank")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("all")
        .setDescription("Deposit all your money into your bank")
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("amount")
        .setDescription("Deposit a specific amount of money into your bank")
        .addIntegerOption((option) =>
          option
            .setName("amount")
            .setDescription("The amount of money you want to deposit")
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(1000000)
        )
    ),
  async execute(interaction) {
    let amount = interaction.options.getInteger("amount");

    const data = await EconomySchema.findOne({
      UserId: interaction.user.id,
    });

    if (!data) {
      return interaction.reply({
        content: "You do not have enough money in your wallet to deposit!",
        ephemeral: true,
      });
    }

    if (interaction.options.getSubcommand() === "all") {
      amount = data.Wallet;
    }

    if (data.Wallet < amount) {
      return interaction.reply({
        content: "You do not have enough money in your wallet to deposit",
        ephemeral: true,
      });
    } else {
      data.Wallet -= amount;
      data.Bank += amount;
      data.save();
      return interaction.reply({
        content: `You deposited ₳${amount} into your bank`,
      });
    }
  },
  requiredPerms: requiredPerms,
};
