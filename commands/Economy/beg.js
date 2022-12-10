const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits } = require("discord.js");
const EconomySchema = require("../../models/EconomyModel");

const requiredPerms = {
  type: "flags",
  key: [PermissionFlagsBits.SendMessages],
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("beg")
    .setDescription("Beg for some cash"),
  async execute(interaction) {
    const responses = [
      "You begged for some cash and received ",
      "You went fishing and the fish gave you ",
      "The poor man gave you ",
      "You found a wallet on the ground and it contained ",
      "The bank felt so bad they gave you ",
    ];
    const randomResponse = Math.floor(Math.random() * 5) + 1;
    const randomAmount = Math.floor(Math.random() * 50) + 30;

    let data = await EconomySchema.findOneAndUpdate(
      {
        UserId: interaction.user.id,
      },
      {
        $inc: {
          Wallet: randomAmount,
          NetWorth: randomAmount,
        },
      }
    );

    if (!data) {
      data = new EconomySchema({
        UserId: interaction.user.id,
        Bank: 0,
        Wallet: randomAmount,
        NetWorth: randomAmount,
      });
      data.save();
    }

    return interaction.reply({
      content: `${responses[randomResponse]} ₳${randomAmount} Bobbucks`,
    });
  },
  requiredPerms: requiredPerms,
};
