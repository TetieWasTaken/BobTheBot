const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits } = require("discord.js");

const requiredPerms = {
  type: "flags",
  key: PermissionFlagsBits.Connect,
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("pause")
    .setDescription("Toggles the pause state of the player"),
  async execute(interaction) {
    const DJRole = interaction.guild.roles.cache.find((role) =>
      ["DJ", "dj", "Dj", "dJ"].includes(role.name)
    );

    if (
      interaction.member.permissions.has(PermissionFlagsBits.ManageMessages) ||
      interaction.member.roles.cache.has(DJRole.id)
    ) {
      const queue = interaction.client.player.getQueue(interaction.guildId);

      if (!queue) {
        return await interaction.reply({
          content: ":wrench: There is no music playing!",
          ephemeral: true,
        });
      }

      if (queue.connection.paused) {
        await queue.setPaused(false);
        await interaction.reply({
          content: ":play_pause: Resumed the player!",
        });
      } else {
        await queue.setPaused(true);
        await interaction.reply({
          content: ":play_pause: Paused the player!",
        });
      }
    } else if (DJRole) {
      await interaction.reply({
        content:
          "You do not have the permission to use this command. You need the `DJ` role or the MANAGE_MESSAGES permission!",
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content:
          "You do not have the permission to use this command. You need the MANAGE_MESSAGES permission or a role named `DJ`!",
        ephemeral: true,
      });
    }
  },
  requiredPerms: requiredPerms,
};
