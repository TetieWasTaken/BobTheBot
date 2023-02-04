const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits } = require("discord.js");
const {
  raiseUserHierarchyError,
  raiseBotHierarchyError,
} = require("../../utils/returnError.js");

const requiredBotPerms = {
  type: "flags",
  key: [PermissionFlagsBits.BanMembers],
};

const requiredUserPerms = {
  type: "flags",
  key: [PermissionFlagsBits.BanMembers],
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Bans a user from the current guild")
    .addUserOption((option) =>
      option.setName("target").setDescription("member to ban").setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("reason for ban")
        .setMaxLength(255)
        .setRequired(false)
    ),
  async execute(interaction) {
    const member = interaction.options.getMember("target");
    let reason =
      interaction.options.getString("reason") ?? "No reason provided";

    const authorMember = await interaction.guild.members.fetch(
      interaction.user.id
    );

    const highestUserRole = member.roles.highest;
    if (highestUserRole.position >= authorMember.roles.highest.position)
      return raiseUserHierarchyError(interaction);

    if (
      highestUserRole.position >=
      interaction.guild.members.me.roles.highest.position
    )
      return raiseBotHierarchyError(interaction);

    try {
      await member.ban({
        deleteMessageSeconds: 604800,
        reason: reason,
      });
    } catch (error) {
      console.error(error);
      try {
        await member.kick({
          reason: reason,
        });
      } catch (error) {
        console.error(error);
        try {
          await member.timeout({
            reason: reason,
            time: 1000 * 60 * 60 * 24 * 7,
          });
        } catch (error) {
          console.error(error);
          return interaction.reply({
            content: `:wrench: An error occurred while trying to ban ${member.user.tag}!\nAn unsuccessfull attempt was made to kick but failed as well! Please manually ban the user.`,
            ephemeral: true,
          });
        }
        return interaction.reply({
          content: `:wrench: An error occurred while trying to ban ${member.user.tag}!\nAn unsuccessfull attempt was made to kick but failed as well! Please manually ban the user.`,
          ephemeral: true,
        });
      }
      return interaction.reply({
        content: `:wrench: An error occurred while trying to ban ${member.user.tag}!\nThey were kicked instead!`,
        ephemeral: true,
      });
    }

    interaction.reply({
      content: `:hammer:  \`${member.user.tag}\` has been banned for \`${reason}\``,
      ephemeral: true,
    });
  },
  requiredBotPerms: requiredBotPerms,
  requiredUserPerms: requiredUserPerms,
};
