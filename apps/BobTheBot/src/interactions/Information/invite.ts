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
    .setName("invite")
    .setDescription("Receive an invite link for the bot")
    .setDMPermission(true),
  async execute(interaction: ChatInputCommandInteraction) {
    const replyEmbed = new EmbedBuilder()
      .setTitle("Invite BobTheBot")
      .setDescription(
        "[**Click here to invite BobTheBot to your server**](https://discord.com/api/oauth2/authorize?client_id=1036359071508484237&permissions=8&scope=bot%20applications.commands)"
      )
      .setColor(interaction.guild?.members?.me?.displayHexColor ?? Color.DiscordPrimary)
      .setTimestamp();

    return interaction.reply({
      embeds: [replyEmbed],
      ephemeral: true,
    });
  },
  requiredBotPerms,
  requiredUserPerms,
};
