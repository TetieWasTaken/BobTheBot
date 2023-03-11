import { SlashCommandBuilder, EmbedBuilder, type ChatInputCommandInteraction } from "discord.js";

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
    .setName("roleinfo")
    .setDescription("Receive information about a role")
    .addRoleOption((option) => option.setName("target").setDescription("role to target").setRequired(true))
    .setDMPermission(false),
  async execute(interaction: ChatInputCommandInteraction<"cached">) {
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
  },
  requiredBotPerms,
  requiredUserPerms,
};
