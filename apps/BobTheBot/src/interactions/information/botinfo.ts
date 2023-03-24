import { version as NodeVersion } from "node:process";
import { EmbedBuilder, version as DjsVersion, type ChatInputCommandInteraction } from "discord.js";
import { version as MongooseVersion } from "mongoose";
import { Color } from "../../constants.js";
import { permissionToString, type ChatInputCommand } from "../../utils/index.js";

export const RequiredPerms = {
  bot: [],
  user: [],
} as const;

export const BotinfoCommand: ChatInputCommand = {
  name: "botinfo",
  description: "Receive information about the bot",
  default_member_permissions: permissionToString(RequiredPerms.user),
  dm_permission: true,
} as const;

export async function execute(interaction: ChatInputCommandInteraction) {
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
        value: `NodeJS: \`${NodeVersion}\`\nDiscord.JS: \`${DjsVersion}\`\nMongoose: \`${MongooseVersion}\``,
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
        value: "[**Github**](https://github.com/TetieWasTaken/BobTheBot)\n[**Discord**](https://discord.gg/FJ5DMEb8zA)",
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
}
