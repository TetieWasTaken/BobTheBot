const { SlashCommandBuilder } = require("@discordjs/builders");
const {
  EmbedBuilder,
  ChannelType,
  PermissionFlagsBits,
  time,
} = require("discord.js");

const requiredPerms = {
  type: "flags",
  key: PermissionFlagsBits.SendMessages,
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("channelinfo")
    .setDescription("Receive information about the current channel"),
  async execute(interaction) {
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

    const channel = interaction.channel;

    const replyEmbed = new EmbedBuilder()
      .setColor(roleColor)
      .setAuthor({
        name: `${channel.name}`,
        iconURL: interaction.guild.iconURL(),
      })
      .addFields({
        name: `Name`,
        value: `${channel.name}`,
        inline: true,
      })
      .addFields({
        name: `ID`,
        value: `${channel.id}`,
        inline: true,
      })
      .addFields({
        name: `Type`,
        value: `${ChannelType[channel.type]}`,
        inline: true,
      })
      .addFields({
        name: `Created at`,
        value: `${time(Math.round(channel.createdTimestamp / 1000), "f")}`,
        inline: true,
      })
      .addFields({
        name: `Position`,
        value: `${channel.position}`,
        inline: false,
      })
      .setTimestamp();

    interaction.reply({
      embeds: [replyEmbed],
    });
  },
  requiredPerms: requiredPerms,
};
