const GuildSchema = require("../models/GuildModel");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "messageDelete",
  once: false,
  async execute(message) {
    if (message.author.bot) return;

    guildData = await GuildSchema.findOne({
      GuildId: message.guild.id,
    });
    if (guildData && guildData.GuildLogChannel !== null) {
      const logChannel = await Promise.resolve(message.guild.channels.fetch(guildData.GuildLogChannel));

      let userNickname = ` (${message.member.nickname ?? ""})`;
      if (userNickname == " (null)") {
        userNickname = "";
      }

      const logEmbed = new EmbedBuilder()
        .setColor(0xffa800)
        .setAuthor({
          name: `${message.author.tag}` + userNickname + " | Message deleted",
          iconURL: `${message.member.user.displayAvatarURL()}`,
        })
        .addFields(
          {
            name: `Channel`,
            value: `${message.channel}`,
            inline: false,
          },
          {
            name: `Message`,
            value: `\`${message.content}\``,
            inline: false,
          },
          {
            name: `ID`,
            value: `\`\`\`ini\nUser = ${message.member.id}\nID = ${message.id}\`\`\``,
            inline: false,
          }
        )
        .setTimestamp();
      logChannel.send({ embeds: [logEmbed] });
    }
  },
};
