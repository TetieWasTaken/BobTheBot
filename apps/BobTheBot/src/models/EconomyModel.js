const mongoose = require("mongoose");

const economySchema = new mongoose.Schema({
  UserId: String,
  Bank: Number,
  Wallet: Number,
  NetWorth: Number,
  Multiplier: Number,
  Inventory: Array,
});

module.exports = mongoose.model("EconomyModel", economySchema);
