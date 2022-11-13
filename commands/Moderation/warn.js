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
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
	    .setDMPermission(false),
    async execute(interaction) {
        const user = interaction.options.getUser('target');
        const reason = interaction.options.getString('reason');

        let profileData;
        try {
            profileData = await profileSchema.findOne({ userId: user });
            if (!profileData) {
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

        await profileSchema.findOneAndUpdate({
            userId: user,
        }, {
            $inc: {
                warningCount: 1,
            }
        });

        const replyEmbed = new EmbedBuilder()
            .setColor(0xffbd67)
            .setTitle('User warned')
            .setDescription(`${user} has been warned for: ${reason}`)
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