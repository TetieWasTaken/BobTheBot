const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits } = require("discord.js");

const requiredPerms = {
  type: "flags",
  key: PermissionFlagsBits.Connect,
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("stop")
    .setDescription("Stops the player and leaves the voice channel"),
  async execute(interaction) {
    const DJRole = interaction.guild.roles.cache.find((role) =>
      ["DJ", "dj"].includes(role.name)
    );
    if (
      !interaction.member.roles.cache.has(DJRole.id) ||
      !interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)
    ) {
      return await interaction.reply({
        content:
          ":wrench: You do not have the permission to use this command. You need the `DJ` role or the `MANAGE_MESSAGES` permission!",
        ephemeral: true,
      });
    }

    const queue = interaction.client.player.getQueue(interaction.guildId);

    if (!queue) {
      return await interaction.reply({
        content: ":wrench: There is no music playing!",
        ephemeral: true,
      });
    }

    queue.destroy();
    await interaction.reply({
      content: ":satellite: Successfully left the voice channel!",
      ephemeral: true,
    });
  },
  requiredPerms: requiredPerms,
};
