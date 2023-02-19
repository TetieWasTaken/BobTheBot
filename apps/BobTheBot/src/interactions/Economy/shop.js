const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const fs = require("fs");

const requiredBotPerms = {
  type: "flags",
  key: [],
};

const requiredUserPerms = {
  type: "flags",
  key: [],
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("shop")
    .setDescription("View the shop")
    .addIntegerOption((option) => option.setName("page").setDescription("The page to view").setRequired(false)),
  async execute(interaction) {
    let page = interaction.options.getInteger("page") ?? 1;

    fs.readFile("./resources/items.json", (err, data) => {
      if (err) throw err;
      const itemsJSON = JSON.parse(data);

      itemsJSON.forEach((item) => {
        if (!item.buyable) itemsJSON.splice(itemsJSON.indexOf(item), 1);
      });

      page = page > Math.ceil(itemsJSON.length / 5) ? Math.ceil(itemsJSON.length / 5) : page;

      const shopEmbed = new EmbedBuilder()
        .setAuthor({ name: "Shop" })
        .setFooter(
          { text: `Page ${page} of ${Math.ceil(itemsJSON.length / 5)}` },
          { iconURL: interaction.user.avatarURL }
        )
        .setColor(0x00ff00);

      for (let i = 0; i < 5; i++) {
        if (itemsJSON[i + (page - 1) * 5]) {
          shopEmbed.addFields({
            name: `${itemsJSON[i + (page - 1) * 5].name} — ₳${itemsJSON[i + (page - 1) * 5].price}`,
            value: `*${itemsJSON[i + (page - 1) * 5].description}*`,
            inline: false,
          });
        }
      }

      return interaction.reply({
        embeds: [shopEmbed],
      });
    });
  },
  requiredBotPerms: requiredBotPerms,
  requiredUserPerms: requiredUserPerms,
};
