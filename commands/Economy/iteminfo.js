const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const { requestItemData } = require("../../utils/requestItemData");
const { raiseMiscellaneousError } = require("../../utils/returnError");

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
    .setName("iteminfo")
    .setDescription("View information about an item")
    .addStringOption((option) => option.setName("item").setDescription("The id of the item to view").setRequired(true)),
  async execute(interaction) {
    const item = interaction.options.getString("item");
    const itemInfo = await requestItemData(item);

    if (!itemInfo)
      return raiseMiscellaneousError(interaction, "Item not found", "The item you specified was not found.");

    switch (itemInfo.usage) {
      case "reusable":
        itemInfo.usage = "♻️";
        break;
      case "consumable":
        itemInfo.usage = "🍽️";
        break;
      default:
        itemInfo.usage = "Unknown";
        break;
    }

    const itemEmbed = new EmbedBuilder()
      .setTitle(`${itemInfo.name}${itemInfo.price ? ` — ₳${itemInfo.price}` : ``}`)
      .setDescription(`\`${itemInfo.id}\` — *${itemInfo.description}*`)
      .addFields(
        {
          name: "Information",
          value: `\`Usage\` — ${itemInfo.usage}\n\`Sellable\` — ${itemInfo.sellable ? "✅" : "❌"}\n\`Buyable\` — ${
            itemInfo.buyable ? "✅" : "❌"
          }`,
          inline: false,
        },
        { name: "Note", value: `*${itemInfo.note ?? "N/A"}*`, inline: false }
      )
      .setColor(0x00ff00);

    if (!itemInfo.note) descriptionEmbed.spliceFields(-1, 1);

    return interaction.reply({
      embeds: [itemEmbed],
    });
  },
  requiredBotPerms: requiredBotPerms,
  requiredUserPerms: requiredUserPerms,
};
