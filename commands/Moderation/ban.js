const { SlashCommandBuilder } = require('@discordjs/builders')
const { PermissionFlagsBits } = require ('discord.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('ban command')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addUserOption((option) => 
            option
                .setName("target")
                .setDescription("member to ban")
                .setRequired(true)
        )
        .addStringOption((option) => 
            option
                .setName("reason")
                .setDescription("reason for ban")
                .setRequired(true)
        ),
    async execute(interaction) {
        const user = interaction.options.getUser('target');
        const reason = interaction.options.getString('reason');

        const member = await interaction.guild.members.fetch(user.id);
        await member.ban({ days: 1, reason: reason });

        const replyEmbed = new EmbedBuilder()
            .setColor(0xFF5555)
            .setTitle('User banned')
            .setDescription(`${user} has been banned for: ${reason}`)
            .setTimestamp()

        interaction.reply({
            embeds: [replyEmbed],
            ephemeral: true
        })
    }
}