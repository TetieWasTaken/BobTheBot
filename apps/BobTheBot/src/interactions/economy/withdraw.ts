import { ApplicationCommandOptionType, type ChatInputCommandInteraction } from "discord.js";
import { EconomyModel } from "../../models/index.js";
import { permissionToString, logger, type ChatInputCommand } from "../../utils/index.js";

export const RequiredPerms = {
  bot: [],
  user: [],
} as const;

export const WithdrawCommand: ChatInputCommand = {
  name: "withdraw",
  description: "Withdraw money from your bank account",
  options: [
    {
      name: "all",
      description: "Withdraw all money from your bank account",
      type: ApplicationCommandOptionType.Subcommand,
    },
    {
      name: "amount",
      description: "Withdraw a specific amount of money from your bank account",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "amount",
          description: "The amount of money to withdraw",
          type: ApplicationCommandOptionType.Integer,
          required: true,
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
}
