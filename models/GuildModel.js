const mongoose = require("mongoose");

const GuildSchema = new mongoose.Schema({
  GuildId: String,
});

module.exports = mongoose.model("GuildModel", GuildSchema);
