const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const EconomySchema = require("../../models/EconomyModel");
const fs = require("fs");

const requiredPerms = {
  type: "flags",
  key: [PermissionFlagsBits.SendMessages],
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("sell")
    .setDescription("Sell an item from your inventory")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("bulk")
        .setDescription("Sell multiple items from your inventory")
        .addStringOption((option) =>
          option
            .setName("item")
            .setDescription("The item you want to sell")
            .setRequired(true)
        )
        .addIntegerOption((option) =>
          option

            .setName("amount")
            .setDescription("The amount of items you want to sell")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("single")
        .setDescription("Sell a single item from your inventory")
        .addStringOption((option) =>
          option
            .setName("item")
            .setDescription("The item you want to sell")
            .setRequired(true)
        )
    ),
  async execute(interaction) {
    const item = interaction.options.getString("item");
    const amount = interaction.options.getInteger("amount") ?? 1;

    const data = await EconomySchema.findOne({
      userId: interaction.user.id,
    });

    if (!data) {
      return interaction.reply({
        content: "🚫 You do not the have the item you are trying to sell",
        ephemeral: true,
      });
    }
    const object = data.Inventory.find((object) => object.name === item);
    if (!object) {
      return interaction.reply({
        content: "🚫 You do not the have the item you are trying to sell",
        ephemeral: true,
      });
    } else {
      if (!object.sellable) {
        return interaction.reply({
          content: "🚫 You cannot sell this item",
          ephemeral: true,
        });
      }
      fs.readFile("./docs/items.json", (err, itemsJSONData) => {
        if (err) throw err;

        if (object.amount < amount) {
          return interaction.reply({
            content: "🚫 You do not have enough of that item",
            ephemeral: true,
          });
        } else {
          const price = object.price;
          const total = price * amount;

          object.amount -= amount;
          if (object.amount === 0) {
            data.Inventory.splice(data.Inventory.indexOf(object), 1);
          }

          data.Inventory = data.Inventory.filter((object) => object.amount > 0);
          data.Wallet += total;
          data.save();

          const sellEmbed = new EmbedBuilder()
            .setTitle("Sell")
            .setDescription(`You sold ${amount} ${object.name} for ₳${total}`)
            .setColor(0x00ff00);

          return interaction.reply({
            embeds: [sellEmbed],
          });
        }
      });
    }
  },
  requiredPerms: requiredPerms,
};
