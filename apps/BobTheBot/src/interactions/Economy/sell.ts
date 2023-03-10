import { SlashCommandBuilder, EmbedBuilder, type ChatInputCommandInteraction } from "discord.js";
import { EconomyModel } from "../../models/index.js";
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
    .setName("sell")
    .setDescription("Sell an item from your inventory")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("bulk")
        .setDescription("Sell multiple items from your inventory")
        .addStringOption((option) =>
          option.setName("item").setDescription("The item you want to sell").setRequired(true)
        )
        .addIntegerOption((option) =>
          option.setName("amount").setDescription("The amount of items you want to sell").setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("single")
        .setDescription("Sell a single item from your inventory")
        .addStringOption((option) =>
          option.setName("item").setDescription("The item you want to sell").setRequired(true)
        )
    )
    .setDMPermission(true),
  async execute(interaction: ChatInputCommandInteraction<"cached">) {
    const item = interaction.options.getString("item", true);
    const amount = interaction.options.getInteger("amount") ?? 1;

    const data = await EconomyModel.findOne({
      userId: interaction.user.id,
    });

    if (!data) {
      return interaction.reply({
        content: "🚫 You do not the have the item you are trying to sell",
        ephemeral: true,
      });
    }

    const object = data.Inventory.find((object) => object.id === item.toLowerCase().replace(/\s+/g, ""));
    if (!object) {
      return interaction.reply({
        content: "🚫 You do not the have the item you are trying to sell",
        ephemeral: true,
      });
    }
    if (object.amount < amount) {
      return interaction.reply({
        content: "🚫 You do not have enough of the item you are trying to sell",
        ephemeral: true,
      });
    }

    const itemObject = await requestItemData(item);
    if (!itemObject)
      return raiseMiscellaneousError(interaction, "Item not found", "The item you specified was not found.");

    if (!itemObject.sellable) return interaction.reply({ content: "🚫 You cannot sell this item", ephemeral: true });

    if (object.amount === amount) {
      data.Inventory.splice(data.Inventory.indexOf(object), 1);
    } else {
      object.amount -= amount;
    }

    data.Wallet = (data.Wallet ?? 0) + (itemObject.price ?? 0) * amount;
    data.save();

    const embed = new EmbedBuilder()
      .setTitle("Item Sold")
      .setDescription(`You sold ${amount} ${itemObject.name} for ${itemObject.price! * amount} coins`)
      .setColor(Color.DiscordSuccess)
      .setTimestamp();

    return interaction.reply({
      embeds: [embed],
      ephemeral: true,
    });
  },
  requiredBotPerms: requiredBotPerms,
  requiredUserPerms: requiredUserPerms,
};
