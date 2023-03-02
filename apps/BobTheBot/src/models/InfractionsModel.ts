import { Schema, model } from "mongoose";

const ProfileSchema = new Schema({
  GuildId: String,
  UserId: String,
  Punishments: Array,
});

export default model("InfractionsModel", ProfileSchema);
