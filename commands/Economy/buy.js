const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits } = require("discord.js");
const EconomySchema = require("../../models/EconomyModel");
const fs = require("fs");

const requiredPerms = {
  type: "flags",
  key: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks],
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("buy")
    .setDescription("Buy an item from the shop")
    .addIntegerOption((option) =>
      option
        .setName("item")
        .setDescription("The number of the item you want to buy")
        .setRequired(true)
    ),
  async execute(interaction) {
    const itemNum = interaction.options.getInteger("item");

    fs.readFile("./docs/shopitems.json", (err, data) => {
      if (err) throw err;
      const shopItems = JSON.parse(data);

      const item = shopItems.find((item) => item.num === itemNum);
      if (!item) {
        return interaction.reply({
          content: "That item does not exist",
          ephemeral: true,
        });
      }

      EconomySchema.findOne({
        UserId: interaction.user.id,
      }).then((data) => {
        if (!data) {
          return interaction.reply({
            content: "You do not have enough money to buy this item",
            ephemeral: true,
          });
        }
        if (data.Wallet < item.price) {
          return interaction.reply({
            content:
              "You do not have enough money in your wallet to buy this item",
            ephemeral: true,
          });
        } else {
          const itemIndex = data.Inventory.findIndex(
            (item) => item.num === itemNum
          );
          if (itemIndex === -1) {
            data.Inventory.push({
              name: item.name,
              num: item.num,
              description: item.description,
              price: item.price,
              amount: 1,
            });
          } else {
            let item = data.Inventory[itemIndex];
            item.amount++;
            data.Inventory[itemIndex] = item;
          }
          data.Wallet -= item.price;
          data.save();
          return interaction.reply({
            content: `You have bought a \`${item.name}\` for ₳\`${item.price}\` Bobbucks`,
          });
        }
      });
    });
  },
  requiredPerms: requiredPerms,
};
