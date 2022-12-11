const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits } = require("discord.js");
const EconomySchema = require("../../models/EconomyModel");

const requiredPerms = {
  type: "flags",
  key: [PermissionFlagsBits.SendMessages],
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("fish")
    .setDescription("Go fishing for some cash"),
  async execute(interaction) {
    const data = await EconomySchema.findOne({
      UserId: interaction.user.id,
    });

    if (!data || !data.Inventory.find((item) => item.name === "Fishing Rod")) {
      return interaction.reply({
        content: "You need a fishing rod to go fishing!",
        ephemeral: true,
      });
    }

    const items = [
      "Shark",
      "Tuna",
      "Salmon",
      "Cod",
      "Bass",
      "Trout",
      "Sardine",
      "Herring",
      "Anchovy",
      "Shoe",
    ];

    const randomItem = Math.floor(Math.random() * 9) + 1;
    const randomAmount = Math.floor(Math.random() * 50) + 30;

    const sellResponses = [
      `You went fishing and caught a ${items[randomItem]}! You sold it for ₳${randomAmount} Bobbucks.`,
      `You went fishing and caught a ${items[randomItem]}! The pawn shop gave you ₳${randomAmount} Bobbucks for it.`,
      `You went fishing and caught a ${items[randomItem]}! A fisherman gave you ₳${randomAmount} Bobbucks for it.`,
      `You went fishing and caught a ${items[randomItem]}! A robber robbed it but left ₳${randomAmount} Bobbucks behind.`,
      `You went fishing and caught a ${items[randomItem]}! Your grandma bought it for ₳${randomAmount} Bobbucks.`,
      `On your way home from fishing, you found a wallet on the ground and it contained ₳${randomAmount} Bobbucks.`,
      `Your fishing rod magically gave you ₳${randomAmount} Bobbucks.`,
    ];

    const randomSellResponse = Math.floor(Math.random() * 4) + 1;

    const rodBreak = Math.floor(Math.random() * 49) + 1;
    if (rodBreak === 1) {
      const rodIndex = data.Inventory.findIndex(
        (item) => item.name === "Fishing Rod"
      );
      data.NetWorth += randomAmount - data.Inventory[rodIndex].price;
      data.Inventory.splice(rodIndex, 1);
      data.Wallet += randomAmount;
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
  requiredPerms: requiredPerms,
};
