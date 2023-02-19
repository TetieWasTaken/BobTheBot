const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const EconomySchema = require("../../models/EconomyModel");
const { useItem } = require("../../utils/useItem");
const { requestItemData } = require("../../utils/requestItemData");

const requiredBotPerms = {
  type: "flags",
  key: [],
};

const requiredUserPerms = {
  type: "flags",
  key: [],
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("use")
    .setDescription("Use an item from your inventory.")
    .addStringOption((option) => option.setName("item").setDescription("The item to use").setRequired(true)),
  async execute(interaction) {
    const itemInput = interaction.options.getString("item");
    const data = await EconomySchema.findOne({
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

    if (!item.useable) {
      return interaction.reply({
        content: `You cannot use this item!`,
        ephemeral: true,
      });
    }

    useItem(interaction, item, data);
    data.save();
  },
  requiredBotPerms: requiredBotPerms,
  requiredUserPerms: requiredUserPerms,
};