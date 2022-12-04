const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");

const requiredPerms = {
  type: "flags",
  key: PermissionFlagsBits.SendMessages,
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("roles")
    .setDescription("Returns a list of all roles in the guild"),
  async execute(interaction) {
    let roleColor = "ffffff";
    const member = interaction.guild.members.cache.get(
      interaction.client.user.id
    );
    const roleCacheSize = member.roles.cache.size;
    if (roleCacheSize >= 2) {
      if (member.roles.color !== null) {
        roleColor = member.roles.color.hexColor;
      }
    }

    const roles = interaction.guild.roles.cache
      .filter((role) => role.id !== interaction.guild.id)
      .toJSON()
      .join("\n");
    const replyEmbed = new EmbedBuilder()
      .setColor(roleColor)
      .addFields({
        name: "Roles",
        value: `
                    ${roles}`,
        inline: true,
      })
      .setFooter({ text: `${interaction.guild.id}` })
      .setTimestamp();

    interaction.reply({
      embeds: [replyEmbed],
    });
  },
  requiredPerms: requiredPerms,
};
