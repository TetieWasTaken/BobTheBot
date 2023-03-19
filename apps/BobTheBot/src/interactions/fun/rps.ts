import { setTimeout } from "node:timers/promises";
import { ApplicationCommandOptionType, type ChatInputCommandInteraction } from "discord.js";
import { permissionToString, logger, type ChatInputCommand } from "../../utils/index.js";

export const RequiredPerms = {
  bot: [],
  user: [],
} as const;

export const RpsCommand: ChatInputCommand = {
  name: "rps",
  description: "Play rock paper scissors with Bob",
  options: [
    {
      name: "choice",
      description: "Your choice",
      type: ApplicationCommandOptionType.String,
      required: true,
      choices: [
        {
          name: "Rock",
          value: ":rock:",
        },
        {
          name: "Paper",
          value: ":newspaper2:",
        },
        {
          name: "Scissors",
          value: ":scissors:",
        },
      ],
    },
    {
      name: "choice2",
      description: "Your choice",
      type: ApplicationCommandOptionType.String,
      required: true,
      choices: [
        {
          name: "Rock",
          value: ":rock:",
        },
        {
          name: "Paper",
          value: ":newspaper2:",
        },
        {
          name: "Scissors",
          value: ":scissors:",
        },
      ],
    },
    {
      name: "choice3",
      description: "Your choice",
      type: ApplicationCommandOptionType.String,
      required: true,
      choices: [
        {
          name: "Rock",
          value: ":rock:",
        },
        {
          name: "Paper",
          value: ":newspaper2:",
        },
        {
          name: "Scissors",
          value: ":scissors:",
        },
      ],
    },
  ],
  default_member_permissions: permissionToString(RequiredPerms.user),
  dm_permission: true,
} as const;

export async function execute(interaction: ChatInputCommandInteraction) {
  const choice = interaction.options.getString("choice");
  const choice2 = interaction.options.getString("choice2");
  const choice3 = interaction.options.getString("choice3");

  const userChoises = [choice, choice2, choice3];

  const result = [];
  const replyMessageArray = [`\`ROCK PAPER SCISSORS\``];

  await interaction.reply({
    content: "`ROCK PAPER SCISSORS`",
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
    replyMessageArray.push(`WINNER: \`PLAYER\``);
  } else if (playerScore < botScore) {
    replyMessageArray.push(`WINNER: \`BOT\``);
  } else {
    replyMessageArray.push(`RESULT: \`TIE\``);
  }

  return interaction.editReply({
    content: `${replyMessageArray.join("\n")}`,
  });
}
