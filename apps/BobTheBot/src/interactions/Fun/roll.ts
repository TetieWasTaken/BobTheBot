import fs from "node:fs";
import { setInterval, clearInterval } from "node:timers";
import { SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";
import { logger } from "../../utils/index.js";

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
    )
    .setDMPermission(true),
  async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> {
    const amount = interaction.options.getInteger("amount") ?? 1;
    const diceFolder = fs.readdirSync("./resources/dice_images");
    let fileDirArray = [];

    await interaction.reply({ content: "Rolling dice...", ephemeral: true });

    let rollCount = 0;
    const rollDiceInterval = setInterval(async () => {
      fileDirArray = [];
      for (let diceCount = 0; diceCount < amount; diceCount++) {
        const randomNum = Math.floor(Math.random() * 6);
        fileDirArray.push(`./resources/dice_images/${diceFolder[randomNum]}`);
      }

      const content = rollCount < 2 ? "Rolling dice..." : "Dice rolled!";
      await interaction.editReply({ content, files: fileDirArray }).catch((error) => {
        logger.error(error);
      });

      if (++rollCount === 3) clearInterval(rollDiceInterval);
    }, 1_000);
  },
  requiredBotPerms,
  requiredUserPerms,
};
