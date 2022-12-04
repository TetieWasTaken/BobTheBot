const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");

const requiredPerms = {
  type: "flags",
  key: PermissionFlagsBits.SendMessages,
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("qrcode")
    .setDescription("Generate a QR code")
    .addStringOption((option) =>
      option
        .setName("url")
        .setDescription("The full URL to generate a QR code for")
        .setRequired(true)
        .setMaxLength(2000)
    ),
  async execute(interaction) {
    const text = interaction.options.getString("url");
    const baseURL = "http://api.qrserver.com/v1";
    const regexString =
      /[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;

    if (!text.match(regexString)) {
      interaction.reply({
        content: `Please enter a valid URL.`,
        ephemeral: true,
      });
      return;
    }

    const encodedURL =
      `${baseURL}/create-qr-code/?size=150x150&data=` +
      encodeURIComponent(text);

    const replyEmbed = new EmbedBuilder()
      .setColor("ffffff")
      .setTitle(`QR Code for ${text}`)
      .setImage(encodedURL)
      .setFooter({ text: `Try it out, it works!` })
      .setTimestamp();

    interaction.reply({ embeds: [replyEmbed] });
  },
  requiredPerms: requiredPerms,
};
