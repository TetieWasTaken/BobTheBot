import { SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";
import { EconomyModel } from "../../models/index.js";
import { logger } from "../../utils/logger.js";

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
    .setName("withdraw")
    .setDescription("Withdraw money from your bank into your wallet")
    .addSubcommand((subcommand) => subcommand.setName("all").setDescription("Withdraw all your money into your wallet"))
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
            .setMaxValue(1_000_000)
        )
    )
    .setDMPermission(true),
  async execute(interaction: ChatInputCommandInteraction<"cached">) {
    let amount = interaction.options.getInteger("amount", true);

    const data = await EconomyModel.findOne({
      UserId: interaction.user.id,
    });

    if (!data?.Bank) {
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
      data.Wallet ??= 0;

      data.Bank -= amount;
      data.Wallet += amount;
      await data.save().catch((error) => logger.error(error));

      return interaction.reply({
        content: `You withdrew ₳${amount} from your bank`,
      });
    }
  },
  requiredBotPerms,
  requiredUserPerms,
};
