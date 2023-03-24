import { ApplicationCommandOptionType, EmbedBuilder, type ChatInputCommandInteraction } from "discord.js";
import { permissionToString, type ChatInputCommand } from "../../utils/index.js";

export const RequiredPerms = {
  bot: [],
  user: [],
} as const;

export const RoleinfoCommand: ChatInputCommand = {
  name: "roleinfo",
  description: "Receive information about a role",
  options: [
    {
      name: "target",
      description: "The role to show information about",
      type: ApplicationCommandOptionType.Role,
      required: true,
    },
  ],
  default_member_permissions: permissionToString(RequiredPerms.user),
  dm_permission: false,
} as const;

export async function execute(interaction: ChatInputCommandInteraction<"cached">) {
  const target = interaction.options.getRole("target", true);
  let permissionsArray = target.permissions.toArray();
  permissionsArray = permissionsArray.filter((permissions: string) =>
    [
      "KickMembers",
      "BanMembers",
      "Administrator",
      "ManageChannels",
      "ManageGuild",
      "ManageMessages",
      "MentionEveryone",
      "ManageRoles",
      "ManageNicknames",
      "ManageWebhooks",
      "ManageEmojisAndStickers",
    ].includes(permissions)
  );
  permissionsArray.sort((a, b) => a.localeCompare(b));

  const replyEmbed = new EmbedBuilder()
    .setColor(target.color)
    .setThumbnail(target.icon)
    .addFields(
      {
        name: `Name`,
        value: `${target.name}`,
        inline: true,
      },
      {
        name: `ID`,
        value: `${target.id}`,
        inline: true,
      },
      {
        name: `Color`,
        value: `${target.hexColor || "none"}`,
        inline: true,
      },
      {
        name: `Hoisted`,
        value: `${target.hoist}`,
        inline: true,
      },
      {
        name: `Mentionable`,
        value: `${target.mentionable}`,
        inline: true,
      },
      {
        name: `Position`,
        value: `${target.position || "none"}`,
        inline: true,
      },
      {
        name: `Key permissions`,
        value: `${permissionsArray.join(", ") || "None"}`,
        inline: false,
      }
    )
    .setTimestamp();

  return interaction.reply({
    embeds: [replyEmbed],
  });
}
