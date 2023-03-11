import { SlashCommandBuilder, EmbedBuilder, type ChatInputCommandInteraction } from "discord.js";
import { Color } from "../../constants.js";

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
    .setName("qrcode")
    .setDescription("Generate a QR code")
    .addStringOption((option) =>
      option
        .setName("url")
        .setDescription("The full URL to generate a QR code for")
        .setRequired(true)
        .setMaxLength(2_000)
    )
    .setDMPermission(true),
  cooldownTime: 10 * 1_000,
  async execute(interaction: ChatInputCommandInteraction<"cached">) {
    const text = interaction.options.getString("url", true);
    const baseURL = "http://api.qrserver.com/v1";
    const regex = /[\w#%()+./:=?@~]{2,256}\.[a-z]{2,6}\b(?<path>[\w#%&+./:=?@~-]*)/;

    if (!regex.test(text)) {
      return interaction.reply({
        content: `Please enter a valid URL.`,
        ephemeral: true,
      });
    }

    const encodedURL = `${baseURL}/create-qr-code/?size=150x150&data=` + encodeURIComponent(text);

    const replyEmbed = new EmbedBuilder()
      .setColor(Color.DiscordPrimary)
      .setTitle(`QR Code for ${text.replace("https://", "").replace("http://", "")}`)
      .setImage(encodedURL)
      .setFooter({ text: `Try it out, it works!` })
      .setTimestamp();

    return interaction.reply({ embeds: [replyEmbed] });
  },

  requiredBotPerms,
  requiredUserPerms,
};
