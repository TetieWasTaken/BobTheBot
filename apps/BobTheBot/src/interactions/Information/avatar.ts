import { SlashCommandBuilder, EmbedBuilder, type ChatInputCommandInteraction } from "discord.js";
import { Color } from "../../constants.js";

const requiredBotPerms = {
  type: "flags" as const,
  key: [] as const,
};

const requiredUserPerms = {
  type: "flags" as const,
  key: [] as const,
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("avatar")
    .setDescription("Returns the avatar of the user specified")
    .addUserOption((option) => option.setName("target").setDescription("user to target").setRequired(false))
    .setDMPermission(true),
  async execute(interaction: ChatInputCommandInteraction) {
    let replyEmbed: EmbedBuilder;

    if (interaction.inCachedGuild()) {
      const member = interaction.options.getMember("target") ?? interaction.member;

      if (!member) return;

      replyEmbed = new EmbedBuilder()
        .setTitle(member.user.username)
        .setFooter({ text: `${member.id}` })
        .setThumbnail(member?.user?.bannerURL() ?? null)
        .setImage(member.displayAvatarURL({ size: 2_048 }))
        .setColor(interaction.guild?.members?.me?.displayHexColor ?? Color.DiscordPrimary)
        .setTimestamp();
    } else {
      const user = interaction.options.getUser("target") ?? interaction.user;

      if (!user) return;

      replyEmbed = new EmbedBuilder()
        .setTitle(user.username)
        .setFooter({ text: `${user.id}` })
        .setThumbnail(user.bannerURL() ?? null)
        .setImage(user.displayAvatarURL({ size: 2_048 }))
        .setColor(Color.DiscordPrimary)
        .setTimestamp();
    }

    return interaction.reply({
      embeds: [replyEmbed],
    });
  },
  requiredBotPerms,
  requiredUserPerms,
};
