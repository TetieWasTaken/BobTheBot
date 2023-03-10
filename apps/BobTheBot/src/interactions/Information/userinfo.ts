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
    .setName("userinfo")
    .setDescription("Get information about a user")
    .addUserOption((option) =>
      option.setName("user").setDescription("The user to get information about").setRequired(false)
    )
    .setDMPermission(true),
  async execute(interaction: ChatInputCommandInteraction<"cached">) {
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
      userAvatar = `[${defaultAvatars[Number(user.displayAvatarURL().match(/\d/))]}](${user.displayAvatarURL()})`;
    else
      userAvatar = `[${user.displayAvatarURL().match(/[a-fA-F0-9]{32}/)}](<${user.displayAvatarURL()}>)${
        user.bannerURL() ? `\nBanner: [${user.bannerURL()?.match(/[a-fA-F0-9]{32}/)}](${user.bannerURL()})` : ""
      }`;

    if (/guilds/.test(member.displayAvatarURL()))
      guildAvatar = `\nGuild avatar: [${member
        .displayAvatarURL()
        .match(/[aA-zZ]_[a-fA-F0-9]{32}/)}](${member.displayAvatarURL()})`;

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
            `Created: <t:${Math.round(user.createdTimestamp / 1000)}>: <t:${Math.round(
              user.createdTimestamp / 1000
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
            `${member.joinedTimestamp ? `Joined: <t:${Math.round(member.joinedTimestamp / 1000)}>` : ""}`,
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
  },
  requiredBotPerms: requiredBotPerms,
  requiredUserPerms: requiredUserPerms,
};
