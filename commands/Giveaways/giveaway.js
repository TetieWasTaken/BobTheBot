const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
} = require("discord.js");
const ms = require("ms");

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
        .addChannelTypes(ChannelType.GuildText)
    )
    .addStringOption((option) =>
      option
        .setName("duration")
        .setDescription(
          "duration of the giveaway, in ms format (ex: 1s, 1m, 1h, 1d, 1w)"
        )
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("winners")
        .setDescription("Amount of winners (defaulted to 1)")
        .setRequired(false)
    ),
  cooldownTime: 20 * 1000,
  async execute(interaction) {
    const prize = interaction.options.getString("prize");
    const channel = interaction.options.getChannel("channel");
    const duration = interaction.options.getString("duration");
    let winners = interaction.options.getInteger("winners") ?? 1;

    if (
      !interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)
    ) {
      return interaction.reply({
        content: "You do not have the `MANAGE_MESSAGES` permission!",
        ephemeral: true,
      });
    }

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
      .catch((err) => {
        console.log(err);
      });

    interaction.reply({
      content: `:gift: Giveaway started successfully in ${channel}`,
      ephemeral: true,
    });
  },
  requiredBotPerms: requiredBotPerms,
  requiredUserPerms: requiredUserPerms,
};
