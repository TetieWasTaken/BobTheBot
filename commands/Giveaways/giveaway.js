const { SlashCommandBuilder } = require("@discordjs/builders");
const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const ms = require("ms");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("giveaway")
    .setDescription("Sets up a giveaway for the server!")
    .addStringOption((option) =>
      option
        .setName("prize")
        .setDescription("What shall the winner(s) win?")
        .setRequired(true)
    )
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("Channel to announce the message in")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("duration")
        .setDescription("Time until the giveaway ends")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("winners")
        .setDescription("Amount of winners (defaulted to 1)")
        .setRequired(false)
    ),
  async execute(interaction) {
    const prize = interaction.options.getString("prize");
    const channel = interaction.options.getChannel("channel");
    const duration = interaction.options.getString("duration");
    let winners = interaction.options.getInteger("winners");
    console.log(winners);
    if (typeof winners == "undefined") {
      console.log(`winners is undefined`);
      winners = 1;
    }
    console.log(winners);

    interaction.client.giveawaysManager
      .start(channel, {
        duration: ms(duration),
        winnerCount: winners,
        prize: prize,
        embedColor: "0xff0000",
        embedColorEnd: "0x33ff00",
        lastChance: {
          enabled: true,
          content: "⚠️ **LAST CHANCE TO ENTER !** ⚠️",
          threshold: 10000,
          embedColor: "0xff6600",
        },
      })
      .then((data) => {
        console.log(data); // {...} (messageId, end date and more)
      })
      .catch((err) => {
        console.log(err);
      });

    const replyEmbed = new EmbedBuilder()
      .setColor(0xffbd67)
      .setTitle(`${prize}`)
      .setDescription(`React with 🎉 to enter!\nTime remaining: \`999\``)
      .setFooter({ text: `${winners} winners` })
      .setTimestamp();

    interaction.reply({
      content: `Preview of the giveaway`,
      embeds: [replyEmbed],
    });
  },
};
