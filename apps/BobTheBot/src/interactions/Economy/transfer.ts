import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { EconomyModel } from "../../models/index.js";
import { requestItemData, raiseMiscellaneousError, IItem } from "../../utils/index.js";

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
    .setName("transfer")
    .setDescription("Transfer Bobbucks or items to another user")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("bobbucks")
        .setDescription("Transfer Bobbucks to another user")
        .addIntegerOption((option) =>
          option
            .setName("amount")
            .setDescription("The amount of Bobbucks to transfer")
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(99999)
        )
        .addUserOption((option) =>
          option.setName("user").setDescription("The user to transfer Bobbucks to").setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("item")
        .setDescription("Transfer an item to another user")
        .addStringOption((option) =>
          option.setName("item").setDescription("The name of the item to transfer").setRequired(true)
        )
        .addUserOption((option) =>
          option.setName("user").setDescription("The user to transfer the item to").setRequired(true)
        )
    ),
  async execute(interaction: ChatInputCommandInteraction<"cached">) {
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

      if (!userData || (userData?.Wallet ?? 0 < amount)) {
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

      const userItem = userData.Inventory.find((i) => i.id === itemName.toLowerCase().replace(/\s+/g, ""));
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
          let item = targetData.Inventory[itemIndex];
          item.amount++;
          targetData.Inventory[itemIndex] = item;
        } else {
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
              useable: item.usable,
              id: item.id,
              amount: 1,
            },
          ],
        });
      }

      targetData.save();
      userData.Inventory.splice(userData.Inventory.indexOf(itemName), 1);
      userData.save();

      return interaction.reply({
        content: `:gift: Successfully transferred \`${itemName}\` to ${target.tag}`,
        ephemeral: true,
      });
    } else {
      return;
    }
  },
  requiredBotPerms: requiredBotPerms,
  requiredUserPerms: requiredUserPerms,
};