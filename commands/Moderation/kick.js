const { SlashCommandBuilder } = require('@discordjs/builders')
const { PermissionFlagsBits } = require ('discord.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kicks a user from the current guild')
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .addUserOption((option) => 
            option
                .setName("target")
                .setDescription("member to kick")
                .setRequired(true)
        )
        .addStringOption((option) => 
            option
                .setName("reason")
                .setDescription("reason for kick")
                .setRequired(true)
        ),
    async execute(interaction) {
        const user = interaction.options.getUser('target');
        const reason = interaction.options.getString('reason');

        const member = await interaction.guild.members.fetch(user.id);
        await member.kick(reason);

        const replyEmbed = new EmbedBuilder()
            .setColor(0x5f241b)
            .setTitle('User kicked')
            .setDescription(`${user} has been kicked for: ${reason}`)
            .setTimestamp()

        interaction.reply({
            embeds: [replyEmbed],
            ephemeral: true
        })
    }
}