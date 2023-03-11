import fs from "node:fs";
import { SlashCommandBuilder, EmbedBuilder, type ChatInputCommandInteraction } from "discord.js";
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
    .setName("shop")
    .setDescription("View the shop")
    .addIntegerOption((option) => option.setName("page").setDescription("The page to view").setRequired(false))
    .setDMPermission(true),
  async execute(interaction: ChatInputCommandInteraction<"cached">) {
    let page = interaction.options.getInteger("page") ?? 1;

    const data = await fs.promises.readFile("./resources/items.json");

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
  },
  requiredBotPerms,
  requiredUserPerms,
};
