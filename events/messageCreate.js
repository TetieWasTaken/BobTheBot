const LevelSchema = require("../models/LevelModel");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "messageCreate",
  once: false,
  async execute(message) {
    const author = message.author;
    const messageLength = message.content.length;

    if (author.bot) return;
    if (message.channel.isDMBased()) {
      const developerArray = ["Tetie#4242"];
      const embed = new EmbedBuilder()
        .addFields({
          name: `Name`,
          value: `
                    BobTheBot`,
          inline: true,
        })
        .addFields({
          name: `ID`,
          value: `
                    1036359071508484237`,
          inline: true,
        })
        .addFields({
          name: `Developers`,
          value: `
                    ${developerArray.join(", ") || "None"}`,
          inline: true,
        })
        .addFields({
          name: `Dependency versions`,
          value: `NodeJS: \`v18.12.0\`\nDiscord.JS: \`14.7.0\`\nMongoose: \`6.7.0\``,
          inline: true,
        })
        .addFields({
          name: `Links`,
          value:
            "[**Github**](https://github.com/)\n[**Discord**](https://discord.com)",
          inline: true,
        })
        .setColor(0x00ff00)
        .setTimestamp();
      message.channel.send({ embeds: [embed] });
      return;
    }

    //https://www.desmos.com/calculator/6lbyqqpk4u
    //Special thanks to @That_Guy977#5882 for helping me with this formula

    const bonusXP = Math.floor(
      Math.min(210 - 115040 / (messageLength + 550), 50)
    );
    const randomNum = Math.floor(Math.random() * 21 + 15);
    const xpToAdd = randomNum + bonusXP;

    const getxpNeededXP = (UserLevel) => 50 * UserLevel ** 2 + 50;

    let data = await LevelSchema.findOneAndUpdate(
      {
        GuildId: message.guild.id,
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
      let xpNeeded = getxpNeededXP(UserLevel + 1);

      if (UserXP >= xpNeeded) {
        ++UserLevel;

        await LevelSchema.updateOne(
          { GuildId: message.guild.id, UserId: author.id },
          { UserLevel, UserXP }
        );
      }
    }

    if (!data) {
      let data = new LevelSchema({
        GuildId: message.guild.id,
        UserId: author.id,
        UserXP: xpToAdd,
        UserLevel: 0,
      });
      data.save();
    }
  },
};
