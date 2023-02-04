const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits } = require("discord.js");
const {
  raiseUserPermissionsError,
  raiseBotPermissionsError,
} = require("../../utils/returnError.js");

const requiredBotPerms = {
  type: "flags",
  key: [PermissionFlagsBits.BanMembers, PermissionFlagsBits.SendMessages],
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

    if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers))
      return raiseUserPermissionsError(interaction, "BAN_MEMBERS");

    if (
      !interaction.guild.members.me.permissions.has(
        PermissionFlagsBits.BanMembers
      )
    )
      return raiseBotPermissionsError(interaction, "BAN_MEMBERS");

    try {
      await interaction.guild.members.unban(userId);

      interaction.reply({
        content: `:scales:  <@${userId}> has been unbanned`,
        ephemeral: true,
      });
    } catch (err) {
      console.log(err);
    }
  },
  requiredBotPerms: requiredBotPerms,
};
