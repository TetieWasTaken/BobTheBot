import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from "discord.js";

const requiredBotPerms = {
  type: "flags" as const,
  key: [] as const,
};

const requiredUserPerms = {
  type: "flags" as const,
  key: [] as const,
};

module.exports = {
  data: new SlashCommandBuilder().setName("meme").setDescription("Sends a random meme from r/memes"),
  async execute(interaction: ChatInputCommandInteraction<"cached">) {
    const data = await fetch(`https://www.reddit.com/r/memes/random/.json`).then((res) => {
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
      .setColor(0x57f287)
      .setTimestamp();

    await interaction.reply({ embeds: [replyEmbed], ephemeral: true });
  },
  requiredBotPerms: requiredBotPerms,
  requiredUserPerms: requiredUserPerms,
};
