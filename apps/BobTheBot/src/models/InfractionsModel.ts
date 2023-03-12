import { Schema, model } from "mongoose";

/**
 * Mongoose schema for guild and user-specific infractions
 *
 * @example
 * ```
 * {
 * "GuildId": "1036359876953251850",
 * "UserId": "923643962537947176",
 * "Punishments": [
 *   {
 *     "PunishType": "WARN",
 *     "Reason": "Spamming",
 *     "CaseId": 2
 *   },
 *   {
 *     "PunishType": "WARN",
 *     "Reason": "No reason provided",
 *     "CaseId": 1
 *   }
 * ],
 * }
 * ```
 */
const ProfileSchema = new Schema({
  GuildId: String,
  UserId: String,
  Punishments: Array,
});

export default model("InfractionsModel", ProfileSchema);
