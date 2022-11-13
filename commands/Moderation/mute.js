const { SlashCommandBuilder } = require('@discordjs/builders')
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Puts a user in timeout for a certain amount of time')
        .addUserOption((option) => 
            option
                .setName("target")
                .setDescription("member to mute")
                .setRequired(true)
        )
        .addStringOption((option) => 
            option
                .setName("reason")
                .setDescription("reason to mute")
                .setRequired(true)
        )
        .addIntegerOption((option) => 
            option
                .setName("duration")
                .setDescription("duration of the mute in hours (default set to 12 hours)")
                .setAutocomplete(true)
                .setRequired(false)
        ),
    async execute(interaction) {
      const target = interaction.options.getUser('target')
      const reason = interaction.options.getString('reason')
      let duration = interaction.options.getInteger('duration')

      if(duration===null) {
          duration = 12;
      }

      const member = await interaction.guild.members.fetch(target.id);
      
      await member.timeout(duration * 60 * 1000 * 60, reason)

      const replyEmbed = new EmbedBuilder()
            .setColor(0xff8355)
            .setTitle('User muted')
            .setDescription(`Target: ${target}\nReason: ${reason}\nDuration: ${duration} hours`)
            .setTimestamp()

        interaction.reply({
            embeds: [replyEmbed]
        })
    }
}