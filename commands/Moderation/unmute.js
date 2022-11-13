const { SlashCommandBuilder } = require('@discordjs/builders')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unmute')
        .setDescription('Removes a user from timeout')
        .addUserOption((option) => 
            option
                .setName("target")
                .setDescription("member to mute")
                .setRequired(true)
        ),
    async execute(interaction) {
      const target = interaction.options.getUser('target')

      const member = await interaction.guild.members.fetch(target.id);
      
      await member.timeout(1000);

        interaction.reply({
            content: `${target} has been unmuted`
        })
    }
}