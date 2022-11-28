const GuildSchema = require("../models/GuildModel");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "messageUpdate",
  once: false,
  async execute(initMessage, newMessage) {
    guildData = await GuildSchema.findOne({
      GuildId: newMessage.guild.id,
    });
    if (guildData && guildData.GuildLogChannel !== null) {
      const logChannel = newMessage.guild.channels.cache.get(
        guildData.GuildLogChannel
      );

      let userNickname = ` (${newMessage.member.nickname})`;
      if (userNickname == " (null)") {
        userNickname = "";
      }

      const logEmbed = new EmbedBuilder()
        .setColor(0xfff033)
        .setAuthor({
          name:
            `${newMessage.member.user.username}#${newMessage.member.user.discriminator}` +
            userNickname +
            " | Message edited",
          iconURL: `${newMessage.member.user.displayAvatarURL()}`,
        })
        .addFields({
          name: `Channel`,
          value: `${newMessage.channel}`,
          inline: false,
        })
        .addFields({
          name: `New message`,
          value: `\`${newMessage.content}\``,
          inline: false,
        })
        .addFields({
          name: `Old message`,
          value: `\`${initMessage.content}\``,
          inline: false,
        })
        .addFields({
          name: `ID`,
          value: `\`\`\`ini\nUser = ${newMessage.member.id}\nID = ${newMessage.id}\`\`\``,
          inline: false,
        })
        .setTimestamp();
      logChannel.send({ embeds: [logEmbed] });
    }
  },
};
