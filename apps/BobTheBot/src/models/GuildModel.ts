import { Schema, model } from "mongoose";

/**
 * Mongoose schema for guild settings
 *
 * @experimental
 * @example
 * ```
 * {
 *   "GuildId": "1036359876953251850",
 *   "GuildLogChannel": "1049011985645322310",
 *   "DisabledCommands": ["Balance", "Ban"]
 * }
 * ```
 */
const GuildSchema = new Schema({
  GuildId: String,
  GuildLogChannel: String,
  DisabledCommands: Array,
});

export default model("GuildModel", GuildSchema);
