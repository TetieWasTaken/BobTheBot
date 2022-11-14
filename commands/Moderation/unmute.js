const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unmute")
    .setDescription("Removes a user from timeout")
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("member to mute")
        .setRequired(true)
    ),
  async execute(interaction) {
    const user = interaction.options.getUser("target");

    const member = await interaction.guild.members.fetch(user.id);

    await member.timeout(1000);

    interaction.reply({
      content: `:loud_sound:  \`${user.username}#${user.discriminator}\` has been unmuted`,
      ephemeral: true,
    });
  },
};
