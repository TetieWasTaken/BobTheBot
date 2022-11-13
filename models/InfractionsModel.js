const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  GuildId: String,
  UserId: String,
  Punishments: Array,
});

const model = mongoose.model("InfractionsModel", profileSchema);

module.exports = model;
