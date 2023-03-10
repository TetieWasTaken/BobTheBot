import { EmbedBuilder, type Message } from "discord.js";
import { GuildModel } from "../models/index.js";
import { Color } from "../constants.js";

module.exports = {
  name: "messageUpdate",
  once: false,
  async execute(initMessage: Message, newMessage: Message): Promise<void> {
    if (newMessage.author.bot) return;
    if (!newMessage.guild) return;

    const guildData = await GuildModel.findOne({
      GuildId: newMessage.guild.id,
    });

    if (guildData && guildData.GuildLogChannel !== null) {
      const logChannelId = guildData?.GuildLogChannel;
      if (!logChannelId) return;
      const logChannel = await newMessage.guild.channels.fetch(logChannelId);
      if (!logChannel || !logChannel.isTextBased()) return;

      const logEmbed = new EmbedBuilder()
        .setColor(Color.DiscordWarning)
        .setAuthor({
          name: `${newMessage.author.tag} (${newMessage.member?.id}) | Message edited`,
          iconURL: `${newMessage.member?.user.displayAvatarURL()}`,
        })
        .addFields(
          {
            name: `Channel`,
            value: `${newMessage.channel}`,
            inline: false,
          },
          {
            name: `New message`,
            value: `\`${newMessage.content}\``,
            inline: false,
          },
          {
            name: `Old message`,
            value: `\`${initMessage.content}\``,
            inline: false,
          },
          {
            name: `ID`,
            value: `\`\`\`ini\nUser = ${newMessage.member?.id}\nID = ${newMessage.id}\`\`\``,
            inline: false,
          }
        )
        .setTimestamp();
      logChannel.send({ embeds: [logEmbed] });
    }
  },
};
