const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits } = require("discord.js");
const fs = require("fs");

const requiredBotPerms = {
  type: "flags",
  key: [],
};

const requiredUserPerms = {
  type: "flags",
  key: [],
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("roll")
    .setDescription("Rolls a dice")
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("Amount of dice to roll")
        .setMaxValue(6)
        .setRequired(false)
    ),
  async execute(interaction) {
    const amount = interaction.options.getInteger("amount") ?? 1;

    diceFolder = fs.readdirSync("./docs/dice_images");
    let fileDirArray = [];

    await interaction.reply({ content: "Rolling dice...", ephemeral: true });

    let j = 0;
    let rollDiceInterval = await setInterval(() => {
      if (j < 2) {
        fileDirArray = [];
        for (let i = 0; i < amount; i++) {
          randomNum = Math.floor(Math.random() * 6);
          fileDirArray.push("./docs/dice_images/" + diceFolder[randomNum]);
        }

        interaction.editReply({
          content: "Rolling dice...",
          files: fileDirArray,
        });
        j++;
      } else {
        fileDirArray = [];
        for (let i = 0; i < amount; i++) {
          randomNum = Math.floor(Math.random() * 6);
          fileDirArray.push("./docs/dice_images/" + diceFolder[randomNum]);
        }

        interaction.editReply({
          content: "Dice rolled!",
          files: fileDirArray,
        });
        clearInterval(rollDiceInterval);
      }
    }, 1000);
  },
  requiredBotPerms: requiredBotPerms,
  requiredUserPerms: requiredUserPerms,
};
