const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const { roleColor } = require("../../functions/roleColor.js");

const requiredPerms = {
  type: "flags",
  key: [
    PermissionFlagsBits.Connect,
    PermissionFlagsBits.SendMessages,
    PermissionFlagsBits.Speak,
    PermissionFlagsBits.EmbedLinks,
  ],
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("np")
    .setDescription("Shows the currently playing track"),
  async execute(interaction) {
    const queue = interaction.client.player.getQueue(interaction.guildId);

    if (!queue) {
      return await interaction.reply({
        content: ":wrench: There is no music playing!",
        ephemeral: true,
      });
    }

    const track = queue.current;

    const embed = new EmbedBuilder()
      .setTitle("Now Playing")
      .setDescription(`[${track.title}](${track.url})`)
      .setThumbnail(track.thumbnail)
      .addFields(
        { name: "Requested by", value: `${track.requestedBy}`, inline: true },
        {
          name: "Repeat Mode",
          value: `${queue.repeatMode ? "On" : "Off"}`,
          inline: true,
        },
        {
          name: "Paused",
          value: `${queue.connection.paused ? "Yes" : "No"}`,
          inline: true,
        },
        {
          name: "Progress",
          value: `${queue.createProgressBar()}`,
          inline: true,
        }
      )
      .setFooter({
        text: `Requested by ${interaction.user.tag}`,
        iconURL: `${interaction.member.displayAvatarURL({
          dynamic: true,
          size: 256,
        })}`,
      })
      .setColor(roleColor(interaction))
      .setTimestamp();

    await interaction.reply({
      embeds: [embed],
    });
  },
  requiredPerms: requiredPerms,
};
