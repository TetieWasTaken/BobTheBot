const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits } = require("discord.js");

const requiredPerms = {
  type: "flags",
  key: PermissionFlagsBits.Connect,
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Skips the current song"),
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

      const currentTrack = queue.current;
      const success = queue.skip();

      await interaction.reply({
        content: success
          ? `:track_next: Skipped **${currentTrack.title}**!`
          : ":wrench: Something went wrong!",
        ephemeral: true,
      });
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
