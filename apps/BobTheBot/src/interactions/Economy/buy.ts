import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { EconomyModel } from "../../models/index.js";
import { requestItemData, raiseMiscellaneousError } from "../../utils/index.js";

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
    .setName("buy")
    .setDescription("Buy an item from the shop")
    .addStringOption((option) => option.setName("item").setDescription("The item to buy").setRequired(true)),
  async execute(interaction: ChatInputCommandInteraction<"cached">) {
    const itemName = interaction.options.getString("item", true);

    const item = await requestItemData(itemName);
    if (!item) return raiseMiscellaneousError(interaction, "Item not found", "The item you specified was not found.");

    if (!item.buyable)
      return interaction.reply({
        content: `\`${item.name}\` is not buyable`,
        ephemeral: true,
      });

    EconomyModel.findOne({
      UserId: interaction.user.id,
    })
      .then((data) => {
        if (!data || !data.Wallet) {
          return interaction.reply({
            content: "You do not have enough money to buy this item",
            ephemeral: true,
          });
        }

        if (data.Wallet < item.price) {
          return interaction.reply({
            content: "You do not have enough money in your wallet to buy this item",
            ephemeral: true,
          });
        } else {
          const itemIndex = data.Inventory.findIndex((item) => item.id === itemName.toLowerCase().replace(/\s+/g, ""));
          if (itemIndex === -1) {
            data.Inventory.push({
              id: item.id,
              amount: 1,
            });
          } else {
            let item = data.Inventory[itemIndex];
            item.amount++;
            data.Inventory[itemIndex] = item;
          }

          data.Wallet -= item.price;
          data.save();

          return interaction.reply({
            content: `You have bought a \`${item.name
              .replace(/:.*?:/g, "")
              .replace(
                /(\u00a9\s|\u00ae\s|[\u2000-\u3300]\s|\ud83c[\ud000-\udfff]\s|\ud83d[\ud000-\udfff]\s|\ud83e[\ud000-\udfff])(\s)?/,
                ""
              )}\` for ₳\`${item.price}\` Bobbucks`,
          });
        }
      })
      .catch((err) => {
        console.error(err);
        return interaction.reply({
          content: "An error occurred while trying to buy this item",
          ephemeral: true,
        });
      });

    return;
  },
  requiredBotPerms: requiredBotPerms,
  requiredUserPerms: requiredUserPerms,
};
