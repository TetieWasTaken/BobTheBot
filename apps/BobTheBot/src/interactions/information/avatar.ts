import { ApplicationCommandOptionType, EmbedBuilder, type ChatInputCommandInteraction } from "discord.js";
import { Color } from "../../constants.js";
import { permissionToString, type ChatInputCommand } from "../../utils/index.js";

export const RequiredPerms = {
  bot: [],
  user: [],
} as const;

export const AvatarCommand: ChatInputCommand = {
  name: "avatar",
  description: "Get the avatar of a user",
  options: [
    {
      name: "target",
      description: "The user to get the avatar of",
      type: ApplicationCommandOptionType.User,
      required: false,
    },
  ],
  default_member_permissions: permissionToString(RequiredPerms.user),
  dm_permission: true,
} as const;

export async function execute(interaction: ChatInputCommandInteraction) {
  let replyEmbed: EmbedBuilder;

  if (interaction.inCachedGuild()) {
    const member = interaction.options.getMember("target") ?? interaction.member;

    if (!member) return;

    replyEmbed = new EmbedBuilder()
      .setTitle(member.user.username)
      .setFooter({ text: `${member.id}` })
      .setThumbnail(member?.user?.bannerURL() ?? null)
      .setImage(member.displayAvatarURL({ size: 2_048 }))
      .setColor(interaction.guild?.members?.me?.displayHexColor ?? Color.DiscordPrimary)
      .setTimestamp();
  } else {
    const user = interaction.options.getUser("target") ?? interaction.user;

    if (!user) return;

    replyEmbed = new EmbedBuilder()
      .setTitle(user.username)
      .setFooter({ text: `${user.id}` })
      .setThumbnail(user.bannerURL() ?? null)
      .setImage(user.displayAvatarURL({ size: 2_048 }))
      .setColor(Color.DiscordPrimary)
      .setTimestamp();
  }

  return interaction.reply({
    embeds: [replyEmbed],
  });
}
