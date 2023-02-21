import type { Message } from "discord.js";
import { LevelModel } from "../models/index.js";

module.exports = {
  name: "messageCreate",
  once: false,
  async execute(message: Message) {
    const author = message.author;
    const messageLength = message.content.length;

    if (author.bot) return;

    //https://www.desmos.com/calculator/6lbyqqpk4u
    //Special thanks to @That_Guy977#5882 for helping me with this formula

    const bonusXP = Math.floor(Math.min(210 - 115040 / (messageLength + 550), 50));
    const randomNum = Math.floor(Math.random() * 21 + 15);
    const xpToAdd = randomNum + bonusXP;

    const getxpNeededXP = (UserLevel: number) => 50 * UserLevel ** 2 + 50;

    let data = await LevelModel.findOneAndUpdate(
      {
        GuildId: message.guild?.id,
        UserId: author.id,
      },
      {
        $inc: {
          UserXP: xpToAdd,
        },
      }
    );

    if (data) {
      let { UserXP, UserLevel } = data;
      if (!UserXP) UserXP = 0;
      if (!UserLevel) UserLevel = 0;

      let xpNeeded = getxpNeededXP(UserLevel + 1);

      if (UserXP >= xpNeeded) {
        ++UserLevel;
        await LevelModel.updateOne({ GuildId: message.guild?.id, UserId: author.id }, { UserLevel, UserXP });
      }
    }

    if (!data) {
      let data = new LevelModel({
        GuildId: message.guild?.id,
        UserId: author.id,
        UserXP: xpToAdd,
        UserLevel: 0,
      });
      data.save();
    }
  },
};
