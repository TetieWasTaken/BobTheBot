import { ApplicationCommandOptionType, EmbedBuilder, type ChatInputCommandInteraction } from "discord.js";
import { Color } from "../../constants.js";
import {
  permissionToString,
  requestItemData,
  raiseMiscellaneousError,
  type ChatInputCommand,
} from "../../utils/index.js";

export const RequiredPerms = {
  bot: [],
  user: [],
} as const;

export const IteminfoCommand: ChatInputCommand = {
  name: "iteminfo",
  description: "Get information about an item",
  options: [
    {
      name: "item",
      description: "The item to get information about",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
  default_member_permissions: permissionToString(RequiredPerms.user),
  dm_permission: true,
} as const;

export async function execute(interaction: ChatInputCommandInteraction) {
  const item = interaction.options.getString("item", true);
  const itemInfo = await requestItemData(item);

  if (!itemInfo) return raiseMiscellaneousError(interaction, "Item not found", "The item you specified was not found.");

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
}
