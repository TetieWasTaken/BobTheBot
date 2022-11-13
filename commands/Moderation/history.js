const { SlashCommandBuilder } = require('@discordjs/builders')
const profileSchema = require('../../models/profileSchema');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('history')
        .setDescription('Check a user\'s infraction history')
        .addUserOption((option) => 
            option
                .setName("target")
                .setDescription("member to view history of")
                .setRequired(true)
        ),
    async execute(interaction) {
        const user = interaction.options.getUser('target');

        let profileData;
        try {
            profileData = await profileSchema.findOne({ userId: user });
            if (!profileData) {
                // issue: saving profile takes too long so interaction.reply cannot reply in time
                let profile = await profileSchema.create({
                    userId: user,
                    guildId: interaction.guild.id,
                    warningCount: 0,
                });
                profile.save();
            }
        } catch (err) {
            console.log(err)
        }

        const replyEmbed = new EmbedBuilder()
            .setColor(0xffbd67)
            .setTitle(`History for ${user}`)
            .addFields(
                { name: `Warns`, value: `
                    ${profileData.warningCount}`, inline: true 
                },
            )
            .setTimestamp()

        interaction.reply({
            embeds: [replyEmbed]
        })
    }
}