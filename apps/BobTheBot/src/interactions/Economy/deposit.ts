import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { EconomyModel } from "../../models/index.js";

const requiredBotPerms = {
  type: "flags" as const,
  key: [] as const,
};

const requiredUserPerms = {
  type: "flags" as const,
  key: [] as const,
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("deposit")
    .setDescription("Deposit money from your wallet into your bank")
    .addSubcommand((subcommand) => subcommand.setName("all").setDescription("Deposit all your money into your bank"))
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
    )
    .setDMPermission(true),
  async execute(interaction: ChatInputCommandInteraction<"cached">) {
    let amount = interaction.options.getInteger("amount", true);

    const data = await EconomyModel.findOne({
      UserId: interaction.user.id,
    });

    if (!data || !data.Wallet) {
      return interaction.reply({
        content: "You do not have enough money in your wallet to deposit!",
        ephemeral: true,
      });
    }

    if (!data.Bank) data.Bank = 0;

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
  requiredBotPerms: requiredBotPerms,
  requiredUserPerms: requiredUserPerms,
};
