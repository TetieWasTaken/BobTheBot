const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");

const requiredPerms = {
  type: "flags",
  key: PermissionFlagsBits.SendMessages,
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
      .addFields({
        name: `Name`,
        value: `
                    ${target.name}`,
        inline: true,
      })
      .addFields({
        name: `ID`,
        value: `
                    ${target.id}`,
        inline: true,
      })
      .addFields({
        name: `Color`,
        value: `
                    ${target.hexColor || "none"}`,
        inline: true,
      })
      .addFields({
        name: `Hoisted`,
        value: `
                    ${target.hoist}`,
        inline: true,
      })
      .addFields({
        name: `Mentionable`,
        value: `
                    ${target.mentionable}`,
        inline: true,
      })
      .addFields({
        name: `Position`,
        value: `
                    ${target.position || "none"}`,
        inline: true,
      })
      .addFields({
        name: `Key permissions`,
        value: `
                    ${permissionsArray.join(", ") || "None"}`,
        inline: false,
      })
      .setTimestamp();
    interaction.reply({
      embeds: [replyEmbed],
    });
  },
  requiredPerms: requiredPerms,
};
