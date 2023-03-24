import { ApplicationCommandOptionType, type ChatInputCommandInteraction } from "discord.js";
import { EconomyModel } from "../../models/index.js";
import {
  permissionToString,
  requestItemData,
  raiseMiscellaneousError,
  logger,
  type ChatInputCommand,
  type IItem,
} from "../../utils/index.js";

export const RequiredPerms = {
  bot: [],
  user: [],
} as const;

export const TransferCommand: ChatInputCommand = {
  name: "transfer",
  description: "Transfer money to another user",
  options: [
    {
      name: "bobbucks",
      description: "Transfer bobbucks to another user",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "user",
          description: "The user to transfer bobbucks to",
          type: ApplicationCommandOptionType.User,
          required: true,
        },
        {
          name: "amount",
          description: "The amount of bobbucks to transfer",
          type: ApplicationCommandOptionType.Integer,
          min_value: 1,
          max_value: 99_999,
          required: true,
        },
      ],
    },
    {
      name: "item",
      description: "Transfer an item to another user",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "user",
          description: "The user to transfer the item to",
          type: ApplicationCommandOptionType.User,
          required: true,
        },

        {
          name: "item",
          description: "The item to transfer",

          type: ApplicationCommandOptionType.String,
          required: true,
        },
      ],
    },
  ],
  default_member_permissions: permissionToString(RequiredPerms.user),
  dm_permission: false,
} as const;

export async function execute(interaction: ChatInputCommandInteraction<"cached">) {
  const target = interaction.options.getUser("user", true);

  const subcommand = interaction.options.getSubcommand();
  if (subcommand === "bobbucks") {
    const amount = interaction.options.getInteger("amount", true);
    if (target.id === interaction.user.id) {
      return interaction.reply({
        content: ":wrench: Unable to transfer bobbucks to yourself",
        ephemeral: true,
      });
    }

    if (target.bot) {
      return interaction.reply({
        content: ":wrench: Unable to transfer bobbucks to a bot",
        ephemeral: true,
      });
    }

    const userData = await EconomyModel.findOne({
      UserId: interaction.user.id,
    });
    let targetData = await EconomyModel.findOne({
      UserId: target.id,
    });

    if (!userData || (userData?.Wallet ?? amount > 0)) {
      return interaction.reply({
        content: ":wrench: You don't have this much bobbucks in your wallet",
        ephemeral: true,
      });
    }

    userData.Wallet ??= 0;
    userData.NetWorth ??= 0;

    if (targetData) {
      targetData.Wallet ??= 0;
      targetData.NetWorth ??= 0;

      userData.Wallet -= amount;
      userData.NetWorth -= amount;
      await userData.save();
      targetData.Wallet += amount;
      targetData.NetWorth += amount;
      await targetData.save();
    } else {
      targetData = new EconomyModel({
        UserId: target.id,
        Wallet: amount,
        Bank: 0,
        NetWorth: amount,
      });
      await targetData.save();
      userData.Wallet -= amount;
      userData.NetWorth -= amount;
      await userData.save();
    }

    return interaction.reply({
      content: `💰 Successfully transferred ₳${amount} bobbucks to ${target.tag}`,
      ephemeral: true,
    });
  } else if (subcommand === "item") {
    const itemName = interaction.options.getString("item", true);

    const item = await requestItemData(itemName);
    if (!item) return raiseMiscellaneousError(interaction, "Item not found", "The item you specified was not found.");

    const userData = await EconomyModel.findOne({
      UserId: interaction.user.id,
    });

    if (!userData) {
      return interaction.reply({
        content: ":wrench: You don't own this item",
        ephemeral: true,
      });
    }

    const userItem = userData.Inventory.find((item) => item.id === itemName.toLowerCase().replaceAll(/\s+/g, ""));
    if (!userItem) {
      return interaction.reply({
        content: ":wrench: You don't own this item",
        ephemeral: true,
      });
    }

    let targetData = await EconomyModel.findOne({
      UserId: target.id,
    });

    if (targetData) {
      const itemId = item.id;

      const itemIndex = targetData.Inventory.findIndex((item: IItem) => item.id === itemId);

      if (itemIndex !== -1) {
        const item = targetData.Inventory[itemIndex];
        item.amount++;
        targetData.Inventory[itemIndex] = item;
      } else if (itemIndex === -1) {
        targetData.Inventory.push(itemName);
      }
    } else {
      targetData = new EconomyModel({
        UserId: target.id,
        Wallet: 0,
        Bank: 0,
        NetWorth: 0,
        Inventory: [
          {
            name: item.name,
            description: item.description,
            type: item.type,
            sellable: item.sellable,
            buyable: item.buyable,
            price: item.price,
            usable: item.usable,
            id: item.id,
            amount: 1,
          },
        ],
      });
    }

    await targetData.save().catch((error) => logger.error(error));
    userData.Inventory.splice(userData.Inventory.indexOf(itemName), 1);
    await userData.save().catch((error) => logger.error(error));

    return interaction.reply({
      content: `:gift: Successfully transferred \`${itemName}\` to ${target.tag}`,
      ephemeral: true,
    });
  } else {
  }
}
