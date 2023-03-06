import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from "discord.js";
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
  data: new SlashCommandBuilder().setName("earn").setDescription("Earn some money").setDMPermission(true),
  cooldownTime: 60 * 2 * 1000,
  async execute(interaction: ChatInputCommandInteraction<"cached">) {
    const responses = {
      data: [
        {
          name: "Fisher",
          value: "A local fisherman gave you some fish and you sold it for ${randomAmount}.",
          randomAmount: Math.floor(Math.random() * 50) + 30,
        },
        {
          name: "Homeless",
          value: "Some homeless guy gave you ₳ ${randomAmount} bobbucks in return for a meal you found in the trash.",
          randomAmount: Math.floor(Math.random() * 15) + 5,
        },
        {
          name: "CEO",
          value: "You begged a CEO for money and he gave you ₳ ${randomAmount} bobbucks.",
          randomAmount: Math.floor(Math.random() * 100) + 50,
        },
        {
          name: "Petty Cash",
          value: "You found ₳ ${randomAmount} bobbucks in the petty cash drawer at work.",
          randomAmount: Math.floor(Math.random() * 50) + 20,
        },
        {
          name: "Garage Sale",
          value: "You sold some old stuff at a garage sale for ₳ ${randomAmount} bobbucks.",
          randomAmount: Math.floor(Math.random() * 30) + 10,
        },
        {
          name: "Freelancing",
          value: "You earned ₳ ${randomAmount} bobbucks from a freelancing gig.",
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
      data.save();
    }

    const embed = new EmbedBuilder()
      .setAuthor({ name: randomResponse.name })
      .setDescription(randomResponse.value.replace("${randomAmount}", `${randomResponse.randomAmount}`));

    return interaction.reply({ embeds: [embed] });
  },
  requiredBotPerms: requiredBotPerms,
  requiredUserPerms: requiredUserPerms,
};
