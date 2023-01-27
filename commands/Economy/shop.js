const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const fs = require("fs");

const requiredPerms = {
  type: "flags",
  key: [PermissionFlagsBits.SendMessages],
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("shop")
    .setDescription("View the shop")
    .addIntegerOption((option) =>
      option
        .setName("page")
        .setDescription("The page to view")
        .setRequired(false)
    ),
  async execute(interaction) {
    let page = interaction.options.getInteger("page") ?? 1;

    fs.readFile("./docs/items.json", (err, data) => {
      if (err) throw err;
      const itemsJSON = JSON.parse(data);

      itemsJSON.forEach((item) => {
        if (!item.buyable) itemsJSON.splice(itemsJSON.indexOf(item), 1);
      });

      page =
        page > Math.ceil(itemsJSON.length / 5)
          ? Math.ceil(itemsJSON.length / 5)
          : page;

      const shopEmbed = new EmbedBuilder()
        .setTitle("Shop")
        .setDescription(`Page ${page} of ${Math.ceil(itemsJSON.length / 5)}`)
        .setColor(0x00ff00);

      let id = 0;

      for (let i = 0; i < 5; i++) {
        if (itemsJSON[i + (page - 1) * 5]) {
          id++;
          shopEmbed.addFields({
            name: `${itemsJSON[i + (page - 1) * 5].name} - ${
              id + (page - 1) * 5
            }`,
            value: `${itemsJSON[i + (page - 1) * 5].description} - ₳${
              itemsJSON[i + (page - 1) * 5].price
            }`,
            inline: false,
          });
        }
      }

      return interaction.reply({
        embeds: [shopEmbed],
      });
    });
  },
  requiredPerms: requiredPerms,
};
