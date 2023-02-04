const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

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
  requiredUserPerms: requiredUserPerms,
};
