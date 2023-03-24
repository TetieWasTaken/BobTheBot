import { ApplicationCommandOptionType, type ChatInputCommandInteraction } from "discord.js";
import { EconomyModel } from "../../models/index.js";
import { permissionToString, requestItemData, useItem, type ChatInputCommand } from "../../utils/index.js";

export const RequiredPerms = {
  bot: [],
  user: [],
} as const;

export const UseCommand: ChatInputCommand = {
  name: "use",
  description: "Use an item",
  options: [
    {
      name: "item",
      description: "The item you want to use",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
  default_member_permissions: permissionToString(RequiredPerms.user),
  dm_permission: true,
} as const;

export async function execute(interaction: ChatInputCommandInteraction) {
  const itemInput = interaction.options.getString("item", true);
  const data = await EconomyModel.findOne({
    UserId: interaction.user.id,
  });

  if (!data) {
    return interaction.reply({
      content: `You do not have this item`,
      ephemeral: true,
    });
  }

  const itemIndex = data.Inventory.findIndex((item) => item.id === itemInput.toLowerCase());

  if (itemIndex === -1) {
    return interaction.reply({
      content: `You do not have this item`,
      ephemeral: true,
    });
  }

  const item = await requestItemData(itemInput);

  if (!item?.usable) {
    return interaction.reply({
      content: `You cannot use this item!`,
      ephemeral: true,
    });
  }

  await useItem(interaction, item, data).catch(async () => {
    return interaction.reply({
      content: `An error occurred while using this item!`,
      ephemeral: true,
    });
  });

  return data.save();
}
