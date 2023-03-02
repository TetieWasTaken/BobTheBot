import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import fs from "fs";

const requiredBotPerms = {
  type: "flags" as const,
  key: [] as const,
};

const requiredUserPerms = {
  type: "flags" as const,
  key: [] as const,
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("roll")
    .setDescription("Rolls a dice")
    .addIntegerOption((option) =>
      option.setName("amount").setDescription("Amount of dice to roll").setMaxValue(6).setRequired(false)
    ),
  async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> {
    const amount = interaction.options.getInteger("amount") ?? 1;

    const diceFolder = fs.readdirSync("./resources/dice_images");
    let fileDirArray = [];

    await interaction.reply({ content: "Rolling dice...", ephemeral: true });

    let j = 0;
    let rollDiceInterval = setInterval(() => {
      if (j < 2) {
        fileDirArray = [];
        for (let i = 0; i < amount; i++) {
          const randomNum = Math.floor(Math.random() * 6);
          fileDirArray.push("./resources/dice_images/" + diceFolder[randomNum]);
        }

        interaction.editReply({
          content: "Rolling dice...",
          files: fileDirArray,
        });
        j++;
      } else {
        fileDirArray = [];
        for (let i = 0; i < amount; i++) {
          const randomNum = Math.floor(Math.random() * 6);
          fileDirArray.push("./resources/dice_images/" + diceFolder[randomNum]);
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
