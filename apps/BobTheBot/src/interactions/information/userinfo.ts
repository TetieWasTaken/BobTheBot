import { ApplicationCommandOptionType, EmbedBuilder, type ChatInputCommandInteraction } from "discord.js";
import { Color } from "../../constants.js";
import { permissionToString, type ChatInputCommand } from "../../utils/index.js";

export const RequiredPerms = {
  bot: [],
  user: [],
} as const;

export const UserinfoCommand: ChatInputCommand = {
  name: "userinfo",
  description: "Returns information about a user",
  options: [
    {
      name: "user",
      description: "The user to get information about",
      type: ApplicationCommandOptionType.User,
      required: false,
    },
  ],
  default_member_permissions: permissionToString(RequiredPerms.user),
  dm_permission: false,
} as const;

export async function execute(interaction: ChatInputCommandInteraction<"cached">) {
  const member = interaction.options.getMember("user") ?? interaction.member;
  const user = member.user;

  let userAvatar;
  let guildAvatar = "";

  const defaultAvatars: Record<number, string> = {
    0: "Default, Blue",
    1: "Default, Gray",
    2: "Default, Green",
    3: "Default, Orange",
    4: "Default, Red",
    5: "Default, Pink",
  };

  if (/avatars\/.\.png/.test(user.displayAvatarURL()))
    userAvatar = `[${defaultAvatars[Number(/\d/.exec(user.displayAvatarURL()))]}](${user.displayAvatarURL()})`;
  else
    userAvatar = `[${/[\dA-Fa-f]{32}/.exec(user.displayAvatarURL())}](<${user.displayAvatarURL()}>)${
      user.bannerURL() ? `\nBanner: [${user.bannerURL()?.match(/[\dA-Fa-f]{32}/)}](${user.bannerURL()})` : ""
    }`;

  if (member.displayAvatarURL().includes("guilds"))
    guildAvatar = `\nGuild avatar: [${/[A-z]_[\dA-Fa-f]{32}/.exec(
      member.displayAvatarURL()
    )}](${member.displayAvatarURL()})`;

  const badges: Record<string, string> = {
    VerifiedBot: "Verified Bot",
    Staff: "Discord Staff",
    CertifiedModerator: "Certified Moderator",
    HypeSquad: "HypeSquad",
    BugHunterLevel1: "Bug Hunter Level 1",
    BugHunterLevel2: "Bug Hunter Level 2",
    HypeSquadOnlineHouse1: "HypeSquad Bravery",
    HypeSquadOnlineHouse2: "HypeSquad Brilliance",
    HypeSquadOnlineHouse3: "HypeSquad Balance",
    PremiumEarlySupporter: "Early Supporter",
    ActiveDeveloper: "Active Developer",
  };

  const userFlags = await user.fetchFlags();
  const formattedUserFlags = userFlags.toArray().map((flag) => `↳ ${badges[flag]}`);

  const replyEmbed = new EmbedBuilder()
    .setColor(member.displayHexColor.startsWith("#000000") ? Color.DiscordEmbedBackground : member.displayHexColor)
    .setThumbnail(user.displayAvatarURL())
    .addFields(
      {
        name: "User info",
        value: [
          `Tag: ${user.tag}`,
          `ID: ${user.id}`,
          `Created: <t:${Math.round(user.createdTimestamp / 1_000)}>: <t:${Math.round(
            user.createdTimestamp / 1_000
          )}:R>`,
          `Avatar: ${userAvatar}`,
          ...(formattedUserFlags.length ? [`Badges: (${formattedUserFlags.length})`, ...formattedUserFlags] : []),
        ]
          .filter((str) => str.trim().length >= 1)
          .join("\n"),
      },
      {
        name: "Member info",
        value: [
          `${member.nickname ? `Nickname: ${member.nickname}` : ""}`,
          `${member.joinedTimestamp ? `Joined: <t:${Math.round(member.joinedTimestamp / 1_000)}>` : ""}`,
          `${guildAvatar}`,
          `${member.roles.hoist ? `Hoist role: ${member.roles.hoist?.name}` : ""}`,
          `${
            member.roles.cache.size >= 2
              ? `Roles: (${member.roles.cache.size - 1})\n${member.roles.cache
                  .filter((role) => role.id !== member.guild.id)
                  .map((role) => `↳ <@&${role.id}>`)
                  .join("\n")}`
              : ""
          }`,
        ]
          .filter((str) => str.trim().length >= 1)
          .join("\n"),
      }
    );

  if (member.roles.icon?.iconURL()) {
    replyEmbed.setFooter({ text: member.roles.highest.name, iconURL: member.roles.icon?.iconURL() ?? undefined });
  }

  return interaction.reply({ embeds: [replyEmbed] });
}
