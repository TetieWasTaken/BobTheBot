import { EmbedBuilder, type Message } from "discord.js";
import { Color } from "../constants.js";
import { GuildModel } from "../models/index.js";
import { logger, type Event } from "../utils/index.js";

export default class implements Event {
  public name = "messageUpdate";

  public once = false;

  public async execute(initMessage: Message, newMessage: Message) {
    if (newMessage.author.bot || !newMessage.guild) return;

    const guildData = await GuildModel.findOne({
      GuildId: newMessage.guild.id,
    });

    if (guildData?.GuildLogChannel) {
      const logChannelId = guildData?.GuildLogChannel;
      if (!logChannelId) return;
      const logChannel = await newMessage.guild.channels.fetch(logChannelId);
      if (!logChannel?.isTextBased()) return;

      if (newMessage.channel.isDMBased()) return;

      const logEmbed = new EmbedBuilder()
        .setColor(Color.DiscordWarning)
        .setAuthor({
          name: `${newMessage.author.tag} (${newMessage.member?.id}) | Message edited`,
          iconURL: `${newMessage.member?.user.displayAvatarURL()}`,
        })
        .addFields(
          {
            name: `Channel`,
            value: `${newMessage.channel.name}`,
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

      await logChannel.send({ embeds: [logEmbed] }).catch((error) => {
        logger.error(error);
      });
    }
  }
}
