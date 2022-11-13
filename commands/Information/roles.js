const { SlashCommandBuilder } = require('@discordjs/builders')
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roles')
        .setDescription('get roles'),
    async execute(interaction) {
        const roles = interaction.guild.roles.cache.filter(role => role.id !== interaction.guild.id).toJSON().join('\n')
      const replyEmbed = new EmbedBuilder()
            .setColor(0xff8355)
            .addFields(
                { name: 'Roles', value: `
                    ${roles}`, inline: true 
                },
            )
            .setFooter({ text: `${interaction.guild.id}` })
            .setTimestamp();

        interaction.reply({
            embeds: [replyEmbed]
        })
    }
}