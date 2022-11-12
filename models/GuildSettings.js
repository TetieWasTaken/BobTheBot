const mongoose = require('mongoose');

const GuildSettingsSchema = new mongoose.Schema({
    guild_id: String,
    guild_log_channel: String,
});

module.exports = mongoose.model("GuildSettings", GuildSettingsSchema);