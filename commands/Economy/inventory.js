const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const EconomySchema = require("../../models/EconomyModel");

const requiredPerms = {
  type: "flags",
  key: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks],
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("inventory")
    .setDescription("View your inventory")
    .addIntegerOption((option) =>
      option
        .setName("page")
        .setDescription("The page you want to view")
        .setRequired(false)
    )
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user you want to view the inventory of")
        .setRequired(false)
    ),
  async execute(interaction) {
    const page = interaction.options.getInteger("page") ?? 1;
    const user = interaction.options.getUser("user") ?? interaction.user;

    const data = await EconomySchema.findOne({
      UserId: user.id,
    });

    if (!data || data.Inventory.length === 0) {
      const inventoryEmbed = new EmbedBuilder()
        .setTitle("Inventory")
        .setColor(0x00ff00)
        .setDescription("You have no items in your inventory");
      return interaction.reply({
        embeds: [inventoryEmbed],
      });
    } else {
      const inventoryEmbed = new EmbedBuilder()
        .setTitle("Inventory")
        .setDescription(`Page ${page}/${Math.ceil(data.Inventory.length / 5)}`)
        .setColor(0x00ff00);
      for (let i = 0; i < 5; i++) {
        if (data.Inventory[i + (page - 1) * 5]) {
          inventoryEmbed.addFields({
            name: `${data.Inventory[i].name} - ${data.Inventory[i].amount}`,
            value: `${data.Inventory[i].description}`,
            inline: false,
          });
        }
      }
      return interaction.reply({
        embeds: [inventoryEmbed],
      });
    }
  },
  requiredPerms: requiredPerms,
};
