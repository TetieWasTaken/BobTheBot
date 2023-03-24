import { readFile } from "node:fs/promises";
import { EmbedBuilder, ApplicationCommandOptionType, type ChatInputCommandInteraction } from "discord.js";
import { Color } from "../../constants.js";
import { permissionToString, type ChatInputCommand } from "../../utils/index.js";

export const RequiredPerms = {
  bot: [],
  user: [],
} as const;

export const ShopCommand: ChatInputCommand = {
  name: "shop",
  description: "View the shop",
  options: [
    {
      name: "page",
      description: "The page you want to view",
      type: ApplicationCommandOptionType.Integer,
      required: false,
    },
  ],
  default_member_permissions: permissionToString(RequiredPerms.user),
  dm_permission: true,
} as const;

export async function execute(interaction: ChatInputCommandInteraction) {
  let page = interaction.options.getInteger("page") ?? 1;

  const data = await readFile("./resources/items.json");

  const itemsJSON = JSON.parse(data.toString());

  for (const item of itemsJSON) if (!item.buyable) itemsJSON.splice(itemsJSON.indexOf(item), 1);

  page = page > Math.ceil(itemsJSON.length / 5) ? Math.ceil(itemsJSON.length / 5) : page;

  const shopEmbed = new EmbedBuilder()
    .setAuthor({ name: "Shop" })
    .setFooter({
      text: `Page ${page} of ${Math.ceil(itemsJSON.length / 5)}`,
      iconURL: `${interaction.user.avatarURL()}`,
    })
    .setColor(Color.DiscordEmbedBackground);

  for (let index = 0; index < 5; index++) {
    if (itemsJSON[index + (page - 1) * 5]) {
      shopEmbed.addFields({
        name: `${itemsJSON[index + (page - 1) * 5].name} — ₳${itemsJSON[index + (page - 1) * 5].price}`,
        value: `*${itemsJSON[index + (page - 1) * 5].description}*`,
        inline: false,
      });
    }
  }

  return interaction.reply({
    embeds: [shopEmbed],
  });
}
