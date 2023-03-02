import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { EconomyModel } from "../../models/index.js";
import { raiseMiscellaneousError } from "../../utils/index.js";

const requiredBotPerms = {
  type: "flags" as const,
  key: [] as const,
};

const requiredUserPerms = {
  type: "flags" as const,
  key: [] as const,
};

module.exports = {
  data: new SlashCommandBuilder().setName("fish").setDescription("Go fishing for some cash"),
  cooldownTime: 60 * 2 * 1000,
  async execute(interaction: ChatInputCommandInteraction<"cached">) {
    const data = await EconomyModel.findOne({
      UserId: interaction.user.id,
    });

    if (!data || !data.Inventory.find((item) => item.id === "fishingrod")) {
      return raiseMiscellaneousError(interaction, "Property Error", "You need a fishing rod to go fishing!");
    }

    data.NetWorth ??= 0;
    data.Wallet ??= 0;

    const items = ["Shark", "Tuna", "Salmon", "Cod", "Bass", "Trout", "Sardine", "Herring", "Anchovy", "Shoe"];

    const randomItem = Math.floor(Math.random() * 9) + 1;
    const randomAmount = Math.floor(Math.random() * 50) + 30;

    const sellResponses = [
      `You went fishing and caught a ${items[randomItem]}! You sold it for ₳${randomAmount} Bobbucks.`,
      `You went fishing and caught a ${items[randomItem]}! The pawn shop gave you ₳${randomAmount} Bobbucks for it.`,
      `You went fishing and caught a ${items[randomItem]}! A fisherman gave you ₳${randomAmount} Bobbucks for it.`,
      `You went fishing and caught a ${items[randomItem]}! A thief stole it but left ₳${randomAmount} Bobbucks behind.`,
      `You went fishing and caught a ${items[randomItem]}! Your grandma bought it for ₳${randomAmount} Bobbucks.`,
      `On your way home from fishing, you found a wallet on the ground and it contained ₳${randomAmount} Bobbucks.`,
      `Your fishing rod magically gave you ₳${randomAmount} Bobbucks.`,
    ];

    const randomSellResponse = Math.floor(Math.random() * 4) + 1;

    const rodBreak = Math.floor(Math.random() * 49) + 1;
    if (rodBreak === 1) {
      const rodIndex = data.Inventory.findIndex((item) => item.name === "Fishing Rod");

      data.NetWorth += randomAmount - data.Inventory[rodIndex].price;
      data.Inventory.splice(rodIndex, 1);
      data.Wallet += randomAmount;
      data.NetWorth += randomAmount;
      data.save();

      return interaction.reply({
        content: `You went fishing and caught a ${items[randomItem]}! Unfortunately, your fishing rod broke and you lost it. The pawn shop gave you ₳${randomAmount} Bobbucks for it.`,
      });
    } else {
      data.Wallet += randomAmount;
      data.NetWorth += randomAmount;
      data.save();

      return interaction.reply({
        content: `${sellResponses[randomSellResponse]}`,
      });
    }
  },
  requiredBotPerms: requiredBotPerms,
  requiredUserPerms: requiredUserPerms,
};
