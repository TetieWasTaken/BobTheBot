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
  data: new SlashCommandBuilder().setName("invite").setDescription("Receive an invite link for the bot"),
  async execute(interaction: ChatInputCommandInteraction) {
    const replyEmbed = new EmbedBuilder()
      .setTitle("Invite BobTheBot")
      .setDescription(
        "[**Click here to invite BobTheBot to your server**](https://discord.com/api/oauth2/authorize?client_id=1036359071508484237&permissions=8&scope=bot%20applications.commands)"
      )
      .setColor(interaction.guild?.members?.me?.displayHexColor ?? 0x5865f2)
      .setTimestamp();
    interaction.reply({
      embeds: [replyEmbed],
      ephemeral: true,
    });
  },
  requiredBotPerms: requiredBotPerms,
  requiredUserPerms: requiredUserPerms,
};
