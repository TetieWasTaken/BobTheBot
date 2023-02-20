import { Schema, model } from "mongoose";

const EconomySchema = new Schema({
  UserId: String,
  Bank: Number,
  Wallet: Number,
  NetWorth: Number,
  Multiplier: Number,
  Inventory: Array,
});

export default model("EconomyModel", EconomySchema);
