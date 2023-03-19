import { EmbedBuilder, type ChatInputCommandInteraction } from "discord.js";
import { Color } from "../../constants.js";
import { permissionToString, type ChatInputCommand } from "../../utils/index.js";

export const RequiredPerms = {
  bot: [],
  user: [],
} as const;

export const MemeCommand: ChatInputCommand = {
  name: "meme",
  description: "Get a random meme from r/memes",
  default_member_permissions: permissionToString(RequiredPerms.user),
  dm_permission: true,
} as const;

export async function execute(interaction: ChatInputCommandInteraction) {
  const data = await fetch(`https://www.reddit.com/r/memes/random/.json`).then(async (res) => {
    return res.json();
  });

  const title = data[0].data.children[0].data.title;
  const image = data[0].data.children[0].data.url;
  const author = data[0].data.children[0].data.author;

  const replyEmbed = new EmbedBuilder()
    .setTitle(title)
    .setURL(`https://reddit.com/r/memes`)
    .setImage(image)
    .setFooter({ text: `Posted by u/${author}` })
    .setColor(Color.DiscordSuccess)
    .setTimestamp();

  await interaction.reply({ embeds: [replyEmbed], ephemeral: true });
}
