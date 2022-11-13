const { SlashCommandBuilder } = require('@discordjs/builders')
const profileSchema = require('../../models/profileSchema');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userprofile')
        .setDescription('check a users\'s profile')
        .addUserOption((option) => 
            option
                .setName("target")
                .setDescription("member to view profile of")
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
                    score: 1
                });
                profile.save();
            }
        } catch (err) {
            console.log(err)
        }

        interaction.reply({
            content: `${user}'s score is: ${profileData.score}`,
            ephemeral: true
        })
    }
}