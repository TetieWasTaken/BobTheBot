const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits } = require("discord.js");

const requiredPerms = {
  type: "flags",
  key: PermissionFlagsBits.BanMembers,
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unban")
    .setDescription("Unbans a user from the current guild")
    .addStringOption((option) =>
      option
        .setName("userid")
        .setDescription("discord id for unban")
        .setRequired(true)
    ),
  async execute(interaction) {
    const userId = interaction.options.getString("userid");

    if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      return interaction.reply({
        content: "You do not have the `BAN_MEMBERS` permission!",
        ephemeral: true,
      });
    }

    if (
      !interaction.guild.members.me.permissions.has(
        PermissionFlagsBits.BanMembers
      )
    ) {
      return interaction.reply({
        content: ":wrench: I do not have the `BAN_MEMBERS` permission!",
        ephemeral: true,
      });
    }

    try {
      await interaction.guild.members.unban(userId);

      interaction.reply({
        content: `:scales:  <@!${userId}> has been unbanned`,
        ephemeral: true,
      });
    } catch (err) {
      console.log(err);
    }
  },
  requiredPerms: requiredPerms,
};
