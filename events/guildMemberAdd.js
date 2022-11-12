const profileSchema = require('../models/profileSchema');

module.exports = async(client, discord, member) => {
    let profile = await profileSchema.create({
        userId: member.id,
        guildId: member.guild.id,
        score: 0
    });
    profile.save();
}