import { EmbedBuilder, type ChatInputCommandInteraction } from "discord.js";
import { EconomyModel } from "../../models/index.js";
import { permissionToString, logger, type ChatInputCommand } from "../../utils/index.js";

export const RequiredPerms = {
  bot: [],
  user: [],
} as const;

export const EarnCommand: ChatInputCommand = {
  name: "earn",
  description: "Earn some money",
  default_member_permissions: permissionToString(RequiredPerms.user),
  dm_permission: true,
} as const;

export async function execute(interaction: ChatInputCommandInteraction) {
  const responses = {
    data: [
      {
        name: "Fisher",
        value: "A local fisherman gave you some fish and you sold it for ##AmountPlaceholder##.",
        randomAmount: Math.floor(Math.random() * 50) + 30,
      },
      {
        name: "Homeless",
        value:
          "Some homeless guy gave you ₳ ##AmountPlaceholder## bobbucks in return for a meal you found in the trash.",
        randomAmount: Math.floor(Math.random() * 15) + 5,
      },
      {
        name: "CEO",
        value: "You begged a CEO for money and he gave you ₳ ##AmountPlaceholder## bobbucks.",
        randomAmount: Math.floor(Math.random() * 100) + 50,
      },
      {
        name: "Petty Cash",
        value: "You found ₳ ##AmountPlaceholder## bobbucks in the petty cash drawer at work.",
        randomAmount: Math.floor(Math.random() * 50) + 20,
      },
      {
        name: "Garage Sale",
        value: "You sold some old stuff at a garage sale for ₳ ##AmountPlaceholder## bobbucks.",
        randomAmount: Math.floor(Math.random() * 30) + 10,
      },
      {
        name: "Freelancing",
        value: "You earned ₳ ##AmountPlaceholder## bobbucks from a freelancing gig.",
        randomAmount: Math.floor(Math.random() * 70) + 40,
      },
    ],
  };

  const randomResponse = responses.data[Math.floor(Math.random() * responses.data.length)]!;

  let data = await EconomyModel.findOneAndUpdate(
    {
      UserId: interaction.user.id,
    },
    {
      $inc: {
        Wallet: randomResponse.randomAmount,
        NetWorth: randomResponse.randomAmount,
      },
    }
  );

  if (!data) {
    data = new EconomyModel({
      UserId: interaction.user.id,
      Bank: 0,
      Wallet: randomResponse.randomAmount,
      NetWorth: randomResponse.randomAmount,
    });

    await data.save().catch((error) => logger.error(error));
  }

  const embed = new EmbedBuilder()
    .setAuthor({ name: randomResponse.name })
    .setDescription(randomResponse.value.replace("##AmountPlaceholder##", `${randomResponse.randomAmount}`));

  return interaction.reply({ embeds: [embed] });
}
