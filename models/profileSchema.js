const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    userId: { type: String, require: true, unique: true },
    guildId: { type: String, require: true},
    score: { type: Number, default: 1 }
});

const model = mongoose.model("ProfileModels", profileSchema);

module.exports = model;