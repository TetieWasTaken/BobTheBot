const { SlashCommandBuilder } = require('@discordjs/builders')
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Receive information about the current guild'),
    async execute(interaction) {
        var serverIcon = interaction.guild.iconURL();
        var boostCount = interaction.guild.premiumSubscriptionCount;
        var boostTier = 0;

        if(boostCount>=2) {
            boostTier = 1;
        } else if (boostCount >= 7) {
            boostTier = 2;
        } else if (boostCount >= 14) {
            boostTier = 3;
        }

        const replyEmbed = new EmbedBuilder()
            .setColor(0xff8355)
            .setAuthor({ name: `${interaction.guild.name}`, iconURL: serverIcon })
            .setThumbnail(serverIcon)
            .addFields(
                { name: 'General information', value: `
                *Member count:* ${interaction.guild.memberCount}
                *Boosts:* ${boostCount}
                *Owner:* <@!${interaction.guild.ownerId}>`, inline: true 
                },
                { name: 'Other', value: `
                *Boost tier:* ${boostTier}
                *Region:* ${interaction.guild.region}`, inline: true 
                },
            )
            .setFooter({ text: `${interaction.guild.id}` })
            .setTimestamp();

        interaction.reply({
            embeds: [replyEmbed]
        })
    }
}