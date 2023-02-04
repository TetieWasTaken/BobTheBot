const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const { roleColor } = require("../../utils/roleColor.js");

const requiredBotPerms = {
  type: "flags",
  key: [],
};

const requiredUserPerms = {
  type: "flags",
  key: [],
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("roles")
    .setDescription("Returns a list of all roles in the guild"),
  async execute(interaction) {
    const roles = await Promise.resolve(
      interaction.guild.roles.fetch().then((roles) => {
        return roles
          .filter((role) => role.id !== interaction.guild.id)
          .toJSON()
          .join("\n");
      })
    );
    const replyEmbed = new EmbedBuilder()
      .setColor(roleColor(interaction))
      .addFields({
        name: "Roles",
        value: `${roles}`,
        inline: true,
      })
      .setFooter({ text: `${interaction.guild.id}` })
      .setTimestamp();

    interaction.reply({
      embeds: [replyEmbed],
    });
  },
  requiredBotPerms: requiredBotPerms,
  requiredUserPerms: requiredUserPerms,
};
