const { SlashCommandBuilder } = require('@discordjs/builders')
const { PermissionFlagsBits } = require ('discord.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('Unbans a user from the current guild')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addStringOption((option) => 
            option
                .setName("userid")
                .setDescription("discord id for unban")
                .setRequired(true)
        ),
    async execute(interaction) {
        const userId = interaction.options.getString('userid');

        const replyEmbed = new EmbedBuilder()
        .setColor(0xa2ff81)
        .setTitle('User unbanned')
        .setDescription(`<@${userId}> has been unbanned`)
        .setTimestamp()
        
        try {
            await interaction.guild.members.unban(userId);

            interaction.reply({
                embeds: [replyEmbed],
                ephemeral: true
            })
        } catch (err) {
            console.log(err);
        }
    }
}