import { Schema, model } from "mongoose";

const LevelSchema = new Schema({
  GuildId: String,
  UserId: String,
  UserXP: Number,
  UserLevel: Number,
});

export default model("LevelModel", LevelSchema);
