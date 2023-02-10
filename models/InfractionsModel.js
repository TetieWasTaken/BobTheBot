const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  GuildId: String,
  UserId: String,
  Punishments: Array,
});

module.exports = mongoose.model("InfractionsModel", profileSchema);
