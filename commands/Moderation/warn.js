const profileSchema = require('../../models/profileSchema');
const { PermissionFlagsBits } = require ('discord.js');
const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require ('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Warns a user in the current guild')
        .addUserOption((option) => 
            option
                .setName("target")
                .setDescription("member to warn")
                .setRequired(true)
        )
        .addStringOption((option) => 
            option
                .setName("reason")
                .setDescription("reason for warn")
                .setRequired(true)
        )
        .addIntegerOption((option) => 
            option
                .setName("severity")
                .setDescription("severity of the warn (default set to minor)")
                .addChoices(
                    { name: 'Minor offense', value: 3 }, 
                    { name: 'Basic offense', value: 5 }, 
                    { name: 'Severe offense', value: 10})
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
	    .setDMPermission(false),
    async execute(interaction) {
        const user = interaction.options.getUser('target');
        const reason = interaction.options.getString('reason');
        const severityValue = interaction.options.getInteger('severity');
        additionalScore = 0;

        let profileData;
        try {
            profileData = await profileSchema.findOne({ userId: user });
            if (!profileData) {
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
        if(severityValue===null){
            additionalScore = 3;
        }
        const newScore = interaction.options.getInteger('severity') + additionalScore;

        await profileSchema.findOneAndUpdate({
            userId: user,
        }, {
            $inc: {
                score: newScore,
            }
        });

        const replyEmbed = new EmbedBuilder()
            .setColor(0xffbd67)
            .setTitle('User warned')
            .setDescription(`${user} has been warned for: ${reason},\nTheir score has been updated to: ${profileData.score + newScore}`)
            .setTimestamp()

        user.send(
            `You have been warned in ${interaction.guild.name} for ${reason}`
        ).catch(console.log);

        interaction.reply({
            embeds: [replyEmbed],
            ephemeral: true
        })
    }
}