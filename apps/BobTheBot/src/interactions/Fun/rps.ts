import { setTimeout } from "node:timers/promises";
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
    .setName("rps")
    .setDescription("Play rock paper scissors!")
    .addStringOption((option) =>
      option
        .setName("choice")
        .setDescription("Your choice")
        .setRequired(true)
        .addChoices(
          { name: "rock", value: ":rock:" },
          { name: "paper", value: ":newspaper2:" },
          { name: "scissors", value: ":scissors:" }
        )
    )
    .addStringOption((option) =>
      option
        .setName("choice2")
        .setDescription("Your choice")
        .setRequired(true)
        .addChoices(
          { name: "rock", value: ":rock:" },
          { name: "paper", value: ":newspaper2:" },
          { name: "scissors", value: ":scissors:" }
        )
    )
    .addStringOption((option) =>
      option
        .setName("choice3")
        .setDescription("Your choice")
        .setRequired(true)
        .addChoices(
          { name: "rock", value: ":rock:" },
          { name: "paper", value: ":newspaper2:" },
          { name: "scissors", value: ":scissors:" }
        )
    )
    .setDMPermission(true),
  async execute(interaction: ChatInputCommandInteraction<"cached">) {
    const choice = interaction.options.getString("choice");
    const choice2 = interaction.options.getString("choice2");
    const choice3 = interaction.options.getString("choice3");

    const userChoises = [choice, choice2, choice3];

    const result = [];
    const replyMessageArray = [`\`ROCK PAPER SCISSORS\``];

    await interaction.reply({
      content: "`ROCK PAPER SCISSORS`",
      ephemeral: true,
    });

    for (let index = 0; index < 3; index++) {
      const randomNum = Math.floor(Math.random() * 3);
      const choices = [":rock:", ":newspaper2:", ":scissors:"];
      const botChoice = choices[randomNum];

      if (userChoises[index] === botChoice) {
        result.push("TIE");
      } else {
        if (userChoises[index] === ":rock:") {
          if (botChoice === ":newspaper2:") {
            result.push("BOT");
          } else {
            result.push("PLAYER");
          }
        }

        if (userChoises[index] === ":newspaper2:") {
          if (botChoice === ":scissors:") {
            result.push("BOT");
          } else {
            result.push("PLAYER");
          }
        }

        if (userChoises[index] === ":scissors:") {
          if (botChoice === ":rock:") {
            result.push("BOT");
          } else {
            result.push("PLAYER");
          }
        }
      }

      replyMessageArray.push(`\`ROUND ${index + 1}:\` ${userChoises[index]} vs ${botChoice} - \`${result[index]}\``);

      await interaction
        .editReply({
          content: `${replyMessageArray.join("\n")}`,
        })
        .catch((error) => logger.error(error));

      await setTimeout(2_000);
    }

    const playerScore = result.filter((x) => x === "PLAYER").length;
    const botScore = result.filter((x) => x === "BOT").length;

    if (playerScore > botScore) {
      replyMessageArray.push(`RESULT: \`PLAYER\``);
    } else if (playerScore < botScore) {
      replyMessageArray.push(`RESULT: \`BOT\``);
    } else {
      replyMessageArray.push(`RESULT: \`TIE\``);
    }

    return interaction.editReply({
      content: `${replyMessageArray.join("\n")}`,
    });
  },
  requiredBotPerms,
  requiredUserPerms,
};
