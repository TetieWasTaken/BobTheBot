import { EmbedBuilder, type ChatInputCommandInteraction } from "discord.js";
import { Color } from "../../constants.js";
import { permissionToString, type ChatInputCommand } from "../../utils/index.js";

export const RequiredPerms = {
  bot: [],
  user: [],
} as const;

export const InviteCommand: ChatInputCommand = {
  name: "invite",
  description: "Generates an invite link for the bot",
  default_member_permissions: permissionToString(RequiredPerms.user),
  dm_permission: true,
} as const;

export async function execute(interaction: ChatInputCommandInteraction) {
  const replyEmbed = new EmbedBuilder()
    .setTitle("Invite BobTheBot")
    .setDescription(
      `[**Click here to invite BobTheBot to your server**](https://discord.com/api/oauth2/authorize?client_id=${interaction.client.user.id}&permissions=8&scope=bot%20applications.commands)`
    )
    .setColor(interaction.guild?.members?.me?.displayHexColor ?? Color.DiscordPrimary)
    .setTimestamp();

  return interaction.reply({
    embeds: [replyEmbed],
    ephemeral: true,
  });
}
