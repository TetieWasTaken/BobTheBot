import { ApplicationCommandOptionType, EmbedBuilder, type ChatInputCommandInteraction } from "discord.js";
import { Color } from "../../constants.js";
import { permissionToString, type ChatInputCommand } from "../../utils/index.js";

export const RequiredPerms = {
  bot: [],
  user: [],
} as const;

export const QrcodeCommand: ChatInputCommand = {
  name: "qrcode",
  description: "Generate a QR code",
  options: [
    {
      name: "url",
      description: "The url to convert to a QR code",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
  default_member_permissions: permissionToString(RequiredPerms.user),
  dm_permission: true,
} as const;

export async function execute(interaction: ChatInputCommandInteraction) {
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
    .setColor(Color.DiscordEmbedBackground)
    .setTitle(`QR Code for ${text.replace(/https?:\/\//, "")}`)
    .setImage(encodedURL)
    .setFooter({ text: `Try it out, it works!` })
    .setTimestamp();

  return interaction.reply({ embeds: [replyEmbed] });
}
