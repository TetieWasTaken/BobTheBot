import { version as nodeVersion } from "node:process";
import { SlashCommandBuilder, EmbedBuilder, version as djsVersion, type ChatInputCommandInteraction } from "discord.js";
import mongoose from "mongoose";
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
    .setName("botinfo")
    .setDescription("Receive information about the bot")
    .setDMPermission(true),
  async execute(interaction: ChatInputCommandInteraction) {
    const releases = await fetch("https://api.github.com/repos/TetieWasTaken/BobTheBot/releases").then(async (res) =>
      res.json()
    );

    const replyEmbed = new EmbedBuilder()
      .setAuthor({
        name: "BobTheBot",
        iconURL: interaction.client.user?.avatarURL() ?? undefined,
      })
      .addFields(
        {
          name: `Dependencies`,
          value: `NodeJS: \`${nodeVersion}\`\nDiscord.JS: \`${djsVersion}\`\nMongoose: \`${mongoose.version}\``,
          inline: true,
        },
        {
          name: `Legal`,
          value:
            "[**Privacy Policy**](https://github.com/TetieWasTaken/BobTheBot/blob/main/apps/BobTheBot/PRIVACY.md)\n[**Terms of Service**](https://github.com/TetieWasTaken/BobTheBot/blob/main/apps/BobTheBot/TOS.md)\n[**License**](https://github.com/TetieWasTaken/BobTheBot/blob/main/LICENSE)",
          inline: true,
        },
        {
          name: `Links`,
          value:
            "[**Github**](https://github.com/TetieWasTaken/BobTheBot)\n[**Discord**](https://discord.gg/FJ5DMEb8zA)",
          inline: true,
        },
        {
          name: `Version`,
          value: `${releases[0]?.name ?? "No releases found"}`, // Placeholder version, will be changed later
          inline: true,
        }
      )
      .setColor(interaction.guild?.members?.me?.displayHexColor ?? Color.DiscordPrimary)
      .setFooter({
        text: `${interaction.client.user.id}`,
        iconURL: interaction.user.avatarURL() ?? undefined,
      })
      .setTimestamp();

    return interaction.reply({
      embeds: [replyEmbed],
    });
  },
  requiredBotPerms,
  requiredUserPerms,
};
