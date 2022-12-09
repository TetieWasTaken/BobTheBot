const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits } = require("discord.js");

const requiredPerms = {
  type: "flags",
  key: [PermissionFlagsBits.BanMembers, PermissionFlagsBits.SendMessages],
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

    const authorMember = await interaction.guild.members.fetch(
      interaction.user.id
    );

    const highestUserRole = member.roles.highest;
    if (
      highestUserRole.position >=
      interaction.guild.members.me.roles.highest.position
    ) {
      return interaction.reply({
        content: `:wrench: Please make sure my role is above the ${highestUserRole} role!`,
        ephemeral: true,
      });
    }
    if (highestUserRole.position >= authorMember.roles.highest.position) {
      return interaction.reply({
        content: `:wrench: ${member} has a higher or equal role than you on the hierarchy!`,
        ephemeral: true,
      });
    }

    await member.ban({
      deleteMessageSeconds: 60 * 60 * 24 * 7,
      reason: reason,
    });

    interaction.reply({
      content: `:hammer:  \`${member.user.username}#${member.user.discriminator}\` has been banned for \`${reason}\``,
      ephemeral: true,
    });
  },
  requiredPerms: requiredPerms,
};
