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
    const page = interaction.options.getInteger("page") ?? 1;

    fs.readFile("./docs/shopitems.json", (err, data) => {
      if (err) throw err;
      const shopItems = JSON.parse(data);

      const shopEmbed = new EmbedBuilder()
        .setTitle("Shop")
        .setDescription(`Page ${page} of ${Math.ceil(shopItems.length / 5)}`)
        .setColor(0x00ff00);

      for (let i = 0; i < 5; i++) {
        if (shopItems[i + (page - 1) * 5]) {
          shopEmbed.addFields({
            name: `${shopItems[i + (page - 1) * 5].name} - ${
              shopItems[i + (page - 1) * 5].num
            }`,
            value: `${shopItems[i + (page - 1) * 5].description} - ₳${
              shopItems[i + (page - 1) * 5].price
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
