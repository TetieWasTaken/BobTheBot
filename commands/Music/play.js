const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const { QueryType } = require("discord-player");

const requiredPerms = {
  type: "flags",
  key: PermissionFlagsBits.Connect,
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Plays a song!")
    .addStringOption((option) =>
      option
        .setName("query")
        .setDescription("The song you want to play")
        .setRequired(true)
    ),
  async execute(interaction) {
    if (!interaction.member.voice.channel)
      return await interaction.reply({
        content: ":wrench: You must be in a voice channel to use this command!",
        ephemeral: true,
      });

    const queue = await interaction.client.player.createQueue(
      interaction.guild
    );
    if (!queue.connection)
      await queue.connect(interaction.member.voice.channel);

    const query = interaction.options.getString("query");
    const searchResult = await interaction.client.player.search(query, {
      requestedBy: interaction.user,
      searchEngine: QueryType.AUTO,
    });

    if (!searchResult || !searchResult.tracks.length)
      return await interaction.reply({
        content: ":wrench: No results were found!",
        ephemeral: true,
      });

    const song = searchResult.tracks[0];

    await queue.addTrack(song);

    let roleColor = "ffffff";
    const member = interaction.guild.members.cache.get(
      interaction.client.user.id
    );
    const roleCacheSize = member.roles.cache.size;
    if (roleCacheSize >= 2) {
      if (member.roles.color !== null) {
        roleColor = member.roles.color.hexColor;
      }
    }

    let replyEmbed = new EmbedBuilder()
      .setTitle("Added to queue")
      .setDescription(`[${song.title}](${song.url})`)
      .setThumbnail(song.thumbnail)
      .setColor(roleColor)
      .setTimestamp();

    if (!queue.playing) await queue.play();

    await interaction.reply({
      embeds: [replyEmbed],
      ephemeral: false,
    });

    // Data structure for query:
    // https://gist.github.com/UndefinedToast/38f9c95378724946e3e6e19a30759524
  },
  requiredPerms: requiredPerms,
};
