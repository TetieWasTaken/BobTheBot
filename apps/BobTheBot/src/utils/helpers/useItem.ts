import type { ChatInputCommandInteraction, InteractionResponse } from "discord.js";
import type { Document } from "mongoose";
import type { IItem } from "../index.js";

type ItemHandlerMap = Record<
  string,
  (interaction: ChatInputCommandInteraction, item: IItem, data: any) => Promise<InteractionResponse<boolean>>
>;

/**
 * @experimental
 * @param interaction - The chat input command interaction to handle
 * @param item - The item to use, as an IItem
 * @param data - The user's data, as a mongoose Document
 * @returns An interaction reply, with either a success or error message
 */
const itemHandlers: ItemHandlerMap = {
  placeholder: async (interaction: ChatInputCommandInteraction, item: IItem, data: any) => {
    const reward = Math.floor(Math.random() * 1_000) + 1;

    data.Inventory[item.name] -= 1;
    data.Wallet += reward;
    data.NetWorth += reward;

    return interaction.reply({
      content: `You used \`${item.name}\` and received \`₳${reward}\` bobbucks`,
      ephemeral: true,
    });
  },
  chicken: async (interaction: ChatInputCommandInteraction, item: IItem, data: any) => {
    switch (item.name) {
      case "Chicken":
        data.Multiplier = 1.2;
        break;
      case "Super Chicken":
        data.Multiplier = 2;
        break;
      case "Ultra Chicken":
        data.Multiplier = 2.5;
        break;
      case "Mega Chicken":
        data.Multiplier = 3;
        break;
      case "Giga Chicken":
        data.Multiplier = 3.5;
        break;
    }

    data.Inventory[item.name] -= 1;

    return interaction.reply({
      content: `You equipped \`${item.name}\` and received a multiplier of \`${data.Multiplier}\``,
      ephemeral: true,
    });
  },
};

/**
 * @experimental
 * @param interaction - The chat input command interaction to handle
 * @param item - The item to use, as an IItem
 * @param data - The user's data, as a mongoose Document
 * @returns An interaction reply, with either a success or error message
 * @example
 * ```
 * const data = await EconomyModel.findOne({
 *  UserId: interaction.user.id,
 * });
 * if (!data) return;
 *
 * const item = await requestItemData(itemInput);
 * if (!item?.usable) return;
 *
 * await useItem(interaction, item, data).catch((error) => { ... });
 * ```
 */
export async function useItem(interaction: ChatInputCommandInteraction, item: IItem, data: Document) {
  const handler = itemHandlers[item.name.toLowerCase()];
  if (handler) {
    return handler(interaction, item, data);
  } else {
    return interaction.reply({
      content: `You cannot use item: ${item.name}`,
      ephemeral: true,
    });
  }
}
