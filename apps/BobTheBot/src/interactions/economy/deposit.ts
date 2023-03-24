import { ApplicationCommandOptionType, type ChatInputCommandInteraction } from "discord.js";
import { EconomyModel } from "../../models/index.js";
import { permissionToString, logger, type ChatInputCommand } from "../../utils/index.js";

export const RequiredPerms = {
  bot: [],
  user: [],
} as const;

export const DepositCommand: ChatInputCommand = {
  name: "deposit",
  description: "Deposit money from your wallet to your bank",
  options: [
    {
      name: "all",
      description: "Deposit all money from your wallet",
      type: ApplicationCommandOptionType.Subcommand,
    },
    {
      name: "amount",
      description: "Deposit a specific amount of money from your wallet",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "amount",
          description: "The amount of money you want to deposit",
          type: ApplicationCommandOptionType.Integer,
        },
      ],
    },
  ],
  default_member_permissions: permissionToString(RequiredPerms.user),
  dm_permission: true,
} as const;

export async function execute(interaction: ChatInputCommandInteraction) {
  let amount = interaction.options.getInteger("amount", true);

  const data = await EconomyModel.findOne({
    UserId: interaction.user.id,
  });

  if (!data?.Wallet) {
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
    await data.save().catch((error) => logger.error(error));

    return interaction.reply({
      content: `You deposited ₳${amount} into your bank`,
    });
  }
}
