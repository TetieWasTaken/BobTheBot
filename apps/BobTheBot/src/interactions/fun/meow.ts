import { EmbedBuilder, type ChatInputCommandInteraction } from "discord.js";
import { Color } from "../../constants.js";
import { permissionToString, type ChatInputCommand } from "../../utils/index.js";

export const RequiredPerms = {
  bot: [],
  user: [],
} as const;

export const MeowCommand: ChatInputCommand = {
  name: "meow",
  description: "Sends a random image of a cat",
  default_member_permissions: permissionToString(RequiredPerms.user),
  dm_permission: true,
} as const;

export async function execute(interaction: ChatInputCommandInteraction) {
  const embed = new EmbedBuilder()
    .setTitle("Meow!")
    .setImage(`https://cataas.com/cat?${Date.now()}`)
    .setColor(Color.DiscordEmbedBackground)
    .setTimestamp()
    .setFooter({
      text: `Requested by ${interaction.user.tag}`,
      iconURL: `${interaction.user.displayAvatarURL()}`,
    });

  await interaction.reply({ embeds: [embed] });
}
