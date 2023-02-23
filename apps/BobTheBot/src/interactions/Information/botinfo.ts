import { SlashCommandBuilder, EmbedBuilder, version, ChatInputCommandInteraction } from "discord.js";
import mongoose from "mongoose";

const requiredBotPerms = {
  type: "flags" as const,
  key: [] as const,
};

const requiredUserPerms = {
  type: "flags" as const,
  key: [] as const,
};

module.exports = {
  data: new SlashCommandBuilder().setName("botinfo").setDescription("Receive information about the bot"),
  async execute(interaction: ChatInputCommandInteraction<"cached">) {
    const releases = await fetch("https://api.github.com/repos/TetieWasTaken/BobTheBot/releases").then((res) =>
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
          value: `NodeJS: \`${process.version}\`\nDiscord.JS: \`${version}\`\nMongoose: \`${mongoose.version}\``,
          inline: true,
        },
        {
          name: `Legal`,
          value:
            "[**Privacy Policy**](https://github.com/TetieWasTaken/BobTheBot/blob/main/PRIVACY.md)\n[**License**](https://github.com/TetieWasTaken/BobTheBot/blob/main/LICENSE)",
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
      .setColor(interaction.guild?.members?.me?.displayHexColor ?? 0x5865f2)
      .setFooter({
        text: `${interaction.client.user.id}`,
        iconURL: interaction.user.avatarURL() ?? undefined,
      })
      .setTimestamp();
    interaction.reply({
      embeds: [replyEmbed],
    });
  },
  requiredBotPerms: requiredBotPerms,
  requiredUserPerms: requiredUserPerms,
};
