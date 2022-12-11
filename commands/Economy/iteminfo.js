const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const fs = require("fs");

const requiredPerms = {
  type: "flags",
  key: [PermissionFlagsBits.SendMessages],
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("iteminfo")
    .setDescription("View information about an item")
    .addIntegerOption((option) =>
      option
        .setName("item")
        .setDescription("The id of the item to view")
        .setRequired(true)
        .setMinValue(1)
    ),
  async execute(interaction) {
    const item = interaction.options.getInteger("item");

    fs.readFile("./docs/shopitems.json", (err, data) => {
      if (err) throw err;
      const shopItems = JSON.parse(data);

      if (item > shopItems.length) {
        return interaction.reply({
          content: "🚫 That item does not exist",
          ephemeral: true,
        });
      }
      const itemInfo = shopItems[item - 1];
      const itemEmbed = new EmbedBuilder()
        .setTitle(itemInfo.name)
        .setDescription(itemInfo.description)
        .setColor(0x00ff00)
        .addFields(
          {
            name: "Price",
            value: `₳${itemInfo.price}`,
            inline: true,
          },
          {
            name: "id",
            value: `${itemInfo.num}`,
            inline: true,
          }
        );
      return interaction.reply({
        embeds: [itemEmbed],
      });
    });
  },
  requiredPerms: requiredPerms,
};
