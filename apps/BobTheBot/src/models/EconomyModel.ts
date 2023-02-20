import mongoose from "mongoose";

const economySchema = new mongoose.Schema({
  UserId: String,
  Bank: Number,
  Wallet: Number,
  NetWorth: Number,
  Multiplier: Number,
  Inventory: Array,
});

export default mongoose.model("EconomyModel", economySchema);
