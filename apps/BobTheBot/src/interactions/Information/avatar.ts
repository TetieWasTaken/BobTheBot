import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from "discord.js";

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
    .addUserOption((option) => option.setName("target").setDescription("user to target").setRequired(false)),
  async execute(interaction: ChatInputCommandInteraction<"cached">) {
    let member = interaction.options.getMember("target") ?? interaction.member;

    if (!member) return;

    const replyEmbed = new EmbedBuilder()
      .setTitle(member.user.username)
      .setFooter({ text: `${member.id}` })
      .setThumbnail(member?.user?.bannerURL() ?? null)
      .setImage(member.displayAvatarURL({ size: 256 }))
      .setColor(interaction.guild?.members?.me?.displayHexColor ?? 0x5865f2)
      .setTimestamp();

    interaction.reply({
      embeds: [replyEmbed],
    });
  },
  requiredBotPerms: requiredBotPerms,
  requiredUserPerms: requiredUserPerms,
};
