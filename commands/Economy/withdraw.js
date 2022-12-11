const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits } = require("discord.js");
const EconomySchema = require("../../models/EconomyModel");

const requiredPerms = {
  type: "flags",
  key: [PermissionFlagsBits.SendMessages],
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("withdraw")
    .setDescription("Withdraw money from your bank into your wallet")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("all")
        .setDescription("Withdraw all your money into your wallet")
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("amount")
        .setDescription("Withdraw a specific amount of money into your wallet")
        .addIntegerOption((option) =>
          option
            .setName("amount")
            .setDescription("The amount of money you want to withdraw")
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
        content: "You do not have enough money in your bank to withdraw!",
        ephemeral: true,
      });
    }

    if (interaction.options.getSubcommand() === "all") {
      amount = data.Bank;
    }

    if (data.Bank < amount) {
      return interaction.reply({
        content: "You do not have enough money in your bank to withdraw",
        ephemeral: true,
      });
    } else {
      data.Bank -= amount;
      data.Wallet += amount;
      data.save();
      return interaction.reply({
        content: `You withdrew ₳${amount} from your bank`,
      });
    }
  },
  requiredPerms: requiredPerms,
};
