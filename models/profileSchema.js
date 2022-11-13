const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    userId: { type: String, require: true, unique: true },
    guildId: { type: String, require: true},
    warningCount: { type: Number, default: 0 },
});

const model = mongoose.model("ProfileModels", profileSchema);

module.exports = model;