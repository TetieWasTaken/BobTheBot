const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const EconomySchema = require("../../models/EconomyModel");
const { genGradient } = require("../../utils/genGradient");

const requiredPerms = {
  type: "flags",
  key: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks],
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("balance")
    .setDescription("Checks someone's balance")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to check")
        .setRequired(false)
    ),
  async execute(interaction) {
    const user = interaction.options.getUser("user") ?? interaction.user;

    const data = await EconomySchema.findOne({
      UserId: user.id,
    });

    if (!data) {
      let replyEmbed = new EmbedBuilder()
        .setTitle(`Balance of ${user.username}#${user.discriminator}`)
        .setColor("#ff0000")
        .addFields(
          {
            name: "🏦  Bank",
            value: "₳ 0",
            inline: true,
          },
          {
            name: "💰  Wallet",
            value: "₳ 0",
            inline: true,
          },
          {
            name: "📈  Net Worth",
            value: "₳ 0",
            inline: false,
          }
        );

      return interaction.reply({
        embeds: [replyEmbed],
      });
    } else {
      let replyEmbed = new EmbedBuilder()
        .setTitle(`balance of ${user.username}#${user.discriminator}`)
        .setColor(
          genGradient(
            "#ff0000",
            "#00ff00",
            Math.min(data.NetWorth / 1000000, 1)
          )
        )
        .addFields(
          {
            name: "🏦  Bank",
            value: `₳ ${data.Bank}`,
            inline: true,
          },
          {
            name: "💰  Wallet",
            value: `₳ ${data.Wallet}`,
            inline: true,
          },
          {
            name: "📈  Net Worth",
            value: `₳ ${data.NetWorth}`,
            inline: false,
          }
        );

      return interaction.reply({
        embeds: [replyEmbed],
      });
    }
  },
  requiredPerms: requiredPerms,
};
