import { Schema, model } from "mongoose";

const GuildSchema = new Schema({
  GuildId: String,
  GuildLogChannel: String,
  DisabledCommands: Array,
});

export default model("GuildModel", GuildSchema);
