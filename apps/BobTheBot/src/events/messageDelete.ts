import { EmbedBuilder, type Message } from "discord.js";
import { Color } from "../constants.js";
import { GuildModel } from "../models/index.js";
import { logger, type Event } from "../utils/index.js";

export default class implements Event {
  public name = "messageDelete";

  public once = false;

  public async execute(message: Message) {
    if (message.author.bot) return;

    const guildData = await GuildModel.findOne({
      GuildId: message.guild?.id,
    });

    if (guildData?.GuildLogChannel) {
      const logChannelId = guildData?.GuildLogChannel;
      if (!logChannelId) return;
      const logChannel = await message.guild?.channels.fetch(logChannelId);
      if (!logChannel?.isTextBased()) return;

      if (message.channel.isDMBased()) return;

      const logEmbed = new EmbedBuilder()
        .setColor(Color.DiscordDanger)
        .setAuthor({
          name: `${message.author.tag} (${message.author.id}) | Message deleted`,
          iconURL: `${message.member?.user.displayAvatarURL()}`,
        })
        .addFields(
          {
            name: `Channel`,
            value: `${message.channel.name}`,
            inline: false,
          },
          {
            name: `Message`,
            value: `\`${message.content}\``,
            inline: false,
          },
          {
            name: `ID`,
            value: `\`\`\`ini\nUser = ${message.member?.id}\nID = ${message.id}\`\`\``,
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
