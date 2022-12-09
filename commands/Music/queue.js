const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const { QueryType } = require("discord-player");

const requiredPerms = {
  type: "flags",
  key: PermissionFlagsBits.SendMessages,
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("queue")
    .setDescription("Shows the current queue")
    .addIntegerOption((option) =>
      option
        .setName("page")
        .setDescription("The page number to show")
        .setRequired(false)
        .setMinValue(1)
    ),
  async execute(interaction) {
    const queue = interaction.client.player.getQueue(interaction.guildId);
    if (!queue || !queue.playing)
      return await interaction.reply({
        content: ":wrench: No music is being played!",
        ephemeral: true,
      });

    const totalPages = Math.ceil(queue.tracks.length / 10) ?? 1;
    const page = interaction.options.getInteger("page") ?? 1 - 1;

    if (page > totalPages)
      return await interaction.reply({
        content: ":wrench: Invalid page number!",
        ephemeral: true,
      });

    const queueString = queue.tracks
      .slice(page * 10, page * 10 + 10)
      .map((track, index) => {
        return `${index + 1 + page * 10}. [${track.title}](${track.url})`;
      });

    const currentTrack = queue.current;

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
      .setTitle("Queue")
      .setDescription(
        `**Current track:** [${currentTrack.title}](${
          currentTrack.url
        })\n\n${queueString.join("\n")}`
      )
      .setThumbnail(currentTrack.thumbnail)
      .setColor(roleColor)
      .setTimestamp();

    interaction.reply({
      embeds: [replyEmbed],
      ephemeral: false,
    });
  },
  requiredPerms: requiredPerms,
};
