import { ApplicationCommandOptionType, EmbedBuilder, type ChatInputCommandInteraction } from "discord.js";
import { Color } from "../../constants.js";
import { EconomyModel } from "../../models/index.js";
import {
  permissionToString,
  requestItemData,
  raiseMiscellaneousError,
  logger,
  type ChatInputCommand,
} from "../../utils/index.js";

export const RequiredPerms = {
  bot: [],
  user: [],
} as const;

export const SellCommand: ChatInputCommand = {
  name: "sell",
  description: "Sell an item",
  options: [
    {
      name: "item",
      description: "The item you want to sell",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
  default_member_permissions: permissionToString(RequiredPerms.user),
  dm_permission: true,
} as const;

export async function execute(interaction: ChatInputCommandInteraction) {
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

  const object = data.Inventory.find((object) => object.id === item.toLowerCase().replaceAll(/\s+/g, ""));
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

  data.Wallet = (data.Wallet ?? 0) + itemObject.price * amount;
  await data.save().catch((error) => logger.error(error));

  const embed = new EmbedBuilder()
    .setTitle("Item Sold")
    .setDescription(`You sold ${amount} ${itemObject.name} for ${itemObject.price! * amount} coins`)
    .setColor(Color.DiscordSuccess)
    .setTimestamp();

  return interaction.reply({
    embeds: [embed],
    ephemeral: true,
  });
}
