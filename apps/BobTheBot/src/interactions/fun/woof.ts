import { EmbedBuilder, type ChatInputCommandInteraction } from "discord.js";
import { Color } from "../../constants.js";
import { permissionToString, type ChatInputCommand } from "../../utils/index.js";

export const RequiredPerms = {
  bot: [],
  user: [],
} as const;

export const WoofCommand: ChatInputCommand = {
  name: "woof",
  description: "Sends a random image of a dog",
  default_member_permissions: permissionToString(RequiredPerms.user),
  dm_permission: true,
} as const;

export async function execute(interaction: ChatInputCommandInteraction) {
  const res = await fetch("https:random.dog/woof.json").then(async (res) => res.json());
  const embed = new EmbedBuilder()
    .setTitle("Woof!")
    .setImage(res.url)
    .setColor(Color.DiscordEmbedBackground)
    .setTimestamp()
    .setFooter({
      text: `Requested by ${interaction.user.tag}`,
      iconURL: `${interaction.user.displayAvatarURL()}`,
    });

  await interaction.reply({ embeds: [embed] });
}
