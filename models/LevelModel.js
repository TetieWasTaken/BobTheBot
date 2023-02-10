const mongoose = require("mongoose");

const levelSchema = new mongoose.Schema({
  GuildId: String,
  UserId: String,
  UserXP: Number,
  UserLevel: Number,
});

module.exports = mongoose.model("LevelModel", levelSchema);
