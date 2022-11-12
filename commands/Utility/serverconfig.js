const { SlashCommandBuilder } = require('@discordjs/builders')
const GuildSchema = require('../../models/GuildSettings')
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverconfig')
        .setDescription('configurate your server')
        .addStringOption((option) => 
            option
                .setName("guild_log_channel")
                .setDescription("Insert the logging channel id here")
                .setRequired(false)
        ),
    async execute(interaction) {
        const guild_log_channel_id = interaction.options.getString('guild_log_channel');

        let guildProfile = await GuildSchema.findOne({ guild_id: interaction.guild.id });
        if (!guildProfile) {
            guildProfile = await new GuildSchema({ 
                guild_id: interaction.guild.id
            });
            await guildProfile.save().catch(err => console.log(err));
        }

        if (guild_log_channel_id != null) {
            await GuildSchema.findOneAndUpdate({
                guild_log_channel: guild_log_channel_id,
            });
        }

        let replyEmbed = new EmbedBuilder()
            .setColor(0xE2E2E2)
            .setTitle('Server settings')
            .setDescription(`Guild settings are shown below, 'undefined' means that that option has not yet been configured.\n\nGuild ID: ${guildProfile.guild_id}\nLog channel: ${guildProfile.guild_log_channel}`)
            .setTimestamp()

        interaction.reply({
            embeds: [replyEmbed],
        })
    }
}