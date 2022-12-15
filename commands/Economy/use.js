const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits } = require("discord.js");
const EconomySchema = require("../../models/EconomyModel");
const { useItem } = require("../../functions/useItem.js");

const requiredPerms = {
  type: "flags",
  key: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks],
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("use")
    .setDescription("Use an item from your inventory.")
    .addStringOption((option) =>
      option.setName("item").setDescription("The item to use").setRequired(true)
    ),
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

    const itemIndex = data.Inventory.findIndex(
      (item) => item.name === itemInput
    );

    if (itemIndex === -1) {
      return interaction.reply({
        content: `You do not have this item`,
        ephemeral: true,
      });
    }

    const item = data.Inventory[itemIndex];

    if (!item.useable) {
      return interaction.reply({
        content: `You cannot use this item!`,
        ephemeral: true,
      });
    }

    useItem(interaction, item, data);
    data.save();
  },
  requiredPerms: requiredPerms,
};
