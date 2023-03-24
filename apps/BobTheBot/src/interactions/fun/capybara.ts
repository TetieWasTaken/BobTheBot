import { EmbedBuilder, type ChatInputCommandInteraction } from "discord.js";
import { Color } from "../../constants.js";
import { permissionToString, type ChatInputCommand } from "../../utils/index.js";

export const RequiredPerms = {
  bot: [],
  user: [],
} as const;

export const CapybaraCommand: ChatInputCommand = {
  name: "capybara",
  description: "Sends a random image of a capybara",
  default_member_permissions: permissionToString(RequiredPerms.user),
  dm_permission: true,
} as const;

export async function execute(interaction: ChatInputCommandInteraction) {
  const img = await fetch("https://api.capy.lol/v1/capybara?json=true").then(async (res) => res.json());

  const embed = new EmbedBuilder()
    .setTitle("Okay I pull up")
    .setImage(`${img.data.url}`)
    .setColor(Color.DiscordEmbedBackground)
    .setFooter({
      text: `Requested by ${interaction.user.tag}`,
      iconURL: `${interaction.user.displayAvatarURL()}`,
    });

  await interaction.reply({ embeds: [embed] });
}
