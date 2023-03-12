import { Schema, model } from "mongoose";

/**
 * Mongoose schema for guild and user-specific levelling
 *
 * @deprecated UserLevel is deprecated and will be removed in a future version
 * @example
 * ```
 * {
 *   "GuildId": "1036359876953251850",
 *   "UserId": "406887792015048715",
 *   "UserXP": 786,
 *   "UserLevel": 3,
 * }
 * ```
 */
const LevelSchema = new Schema({
  GuildId: String,
  UserId: String,
  UserXP: Number,
  UserLevel: Number,
});

export default model("LevelModel", LevelSchema);
