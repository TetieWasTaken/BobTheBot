import { readFileSync } from "node:fs";
import { ApplicationCommandOptionType, type ChatInputCommandInteraction } from "discord.js";
import { permissionToString, type ChatInputCommand } from "../../utils/index.js";

export const RequiredPerms = {
  bot: [],
  user: [],
} as const;

export const BallCommand: ChatInputCommand = {
  name: "8ball",
  description: "Ask the magic 8ball a question",
  options: [
    {
      name: "question",
      description: "The question you want to ask the magic 8ball",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
  default_member_permissions: permissionToString(RequiredPerms.user),
  dm_permission: true,
} as const;

export async function execute(interaction: ChatInputCommandInteraction) {
  const eightballTxt = readFileSync("./resources/8ballresponses.txt").toString().split("\n");
  const randomNum = Math.floor(Math.random() * 20);

  return interaction.reply({
    content: `\`${interaction.options.getString("question")}\`\n:8ball: ${eightballTxt[randomNum]}`,
  });
}
