import { Schema, model } from "mongoose";

/**
 * Mongoose schema for user-specific economy
 *
 * @deprecated NetWorth is deprecated and will be removed in a future version
 * @experimental
 * @example
 * ```
 * {
 *   "UserId": "406887792015048715",
 *   "Bank": "100",
 *   "Wallet": "50",
 *   "NetWorth": "220",
 *   "Multiplier": "1",
 *   "Inventory":
 *   [
 *     {
 *       "id": "fishingrod",
 *       "amount": 1
 *     }
 *   ],
 * }
 * ```
 */
const EconomySchema = new Schema({
  UserId: String,
  Bank: Number,
  Wallet: Number,
  NetWorth: Number,
  Multiplier: Number,
  Inventory: Array,
});

export default model("EconomyModel", EconomySchema);
