const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");

const requiredBotPerms = {
  type: "flags",
  key: [],
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("roleinfo")
    .setDescription("Receive information about a role")
    .addRoleOption((option) =>
      option
        .setName("target")
        .setDescription("role to target")
        .setRequired(true)
    ),
  async execute(interaction) {
    const target = interaction.options.getRole("target");
    let permissionsArray = target.permissions.toArray();
    permissionsArray = permissionsArray.filter((e) =>
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
      ].includes(e)
    );
    permissionsArray.sort();
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
    interaction.reply({
      embeds: [replyEmbed],
    });
  },
  requiredBotPerms: requiredBotPerms,
};
