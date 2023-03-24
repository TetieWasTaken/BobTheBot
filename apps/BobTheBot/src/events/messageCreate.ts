import type { Message } from "discord.js";
import { LevelModel } from "../models/index.js";
import { logger, type Event } from "../utils/index.js";

/**
 * Calculates the amount of XP needed to level up
 *
 * @param UserLevel - The user's current level
 * @returns The amount of XP needed to level up
 * @example
 * ```
 * const xpNeeded = getxpNeededXP(3);
 * console.log(xpNeeded); // 500
 * ```
 */
const getxpNeededXP = (UserLevel: number) => 50 * UserLevel ** 2 + 50;

export default class implements Event {
  public name = "messageCreate";

  public once = false;

  /**
   * Handles the messageCreate event and adds XP to the user
   *
   *  @param message - The message that was created and is being handled
   * @example
   */
  public async execute(message: Message) {
    const author = message.author;
    const messageLength = message.content.length;

    if (author.bot) return;

    // https://www.desmos.com/calculator/6lbyqqpk4u
    // Special thanks to @That_Guy977#5882 for helping me with this formula

    const bonusXP = Math.floor(Math.min(210 - 115_040 / (messageLength + 550), 50));
    const randomNum = Math.floor(Math.random() * 21 + 15);
    const xpToAdd = randomNum + bonusXP;

    const data = await LevelModel.findOneAndUpdate(
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

      const xpNeeded = getxpNeededXP(UserLevel + 1);

      if (UserXP >= xpNeeded) {
        ++UserLevel;
        await LevelModel.updateOne({ GuildId: message.guild?.id, UserId: author.id }, { UserLevel, UserXP });
      }
    }

    if (!data) {
      const data = new LevelModel({
        GuildId: message.guild?.id,
        UserId: author.id,
        UserXP: xpToAdd,
        UserLevel: 0,
      });

      await data.save().catch((error) => {
        logger.error(error);
      });
    }
  }
}
