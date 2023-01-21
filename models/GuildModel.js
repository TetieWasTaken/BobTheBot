const mongoose = require("mongoose");

const GuildSchema = new mongoose.Schema({
  GuildId: String,
  GuildLogChannel: String,
  DisabledCommands: Array,
});

module.exports = mongoose.model("GuildModel", GuildSchema);
