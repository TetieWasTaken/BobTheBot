import { EmbedBuilder, type Message } from "discord.js";
import { GuildModel } from "../models/index.js";
import { Color } from "../constants.js";

module.exports = {
  name: "messageDelete",
  once: false,
  async execute(message: Message) {
    if (message.author.bot) return;

    const guildData = await GuildModel.findOne({
      GuildId: message.guild?.id,
    });

    if (guildData && guildData.GuildLogChannel !== null) {
      const logChannelId = guildData?.GuildLogChannel;
      if (!logChannelId) return;
      const logChannel = await message.guild?.channels.fetch(logChannelId);
      if (!logChannel || !logChannel.isTextBased()) return;

      const logEmbed = new EmbedBuilder()
        .setColor(Color.DiscordDanger)
        .setAuthor({
          name: `${message.author.tag} (${message.author.id}) | Message deleted`,
          iconURL: `${message.member?.user.displayAvatarURL()}`,
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
            value: `\`\`\`ini\nUser = ${message.member?.id}\nID = ${message.id}\`\`\``,
            inline: false,
          }
        )
        .setTimestamp();
      logChannel.send({ embeds: [logEmbed] });
    }
  },
};
