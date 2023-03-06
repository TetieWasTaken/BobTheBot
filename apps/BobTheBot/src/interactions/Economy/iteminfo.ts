import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from "discord.js";
import { requestItemData, raiseMiscellaneousError } from "../../utils/index.js";
import { Color } from "../../constants.js";

const requiredBotPerms = {
  type: "flags" as const,
  key: [] as const,
};

const requiredUserPerms = {
  type: "flags" as const,
  key: [] as const,
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("iteminfo")
    .setDescription("View information about an item")
    .addStringOption((option) => option.setName("item").setDescription("The id of the item to view").setRequired(true))
    .setDMPermission(true),
  async execute(interaction: ChatInputCommandInteraction<"cached">) {
    const item = interaction.options.getString("item", true);
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
      .setColor(Color.DiscordEmbedBackground);

    if (!itemInfo.note) itemEmbed.spliceFields(-1, 1);

    return interaction.reply({
      embeds: [itemEmbed],
    });
  },
  requiredBotPerms: requiredBotPerms,
  requiredUserPerms: requiredUserPerms,
};
