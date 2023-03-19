import { readFileSync } from "node:fs";
import type { ChatInputCommandInteraction } from "discord.js";
import { permissionToString, type ChatInputCommand } from "../../utils/index.js";

export const RequiredPerms = {
  bot: [],
  user: [],
} as const;

export const DadjokeCommand: ChatInputCommand = {
  name: "dadjoke",
  description: "Get a random dad joke",
  default_member_permissions: permissionToString(RequiredPerms.user),
  dm_permission: true,
} as const;

export async function execute(interaction: ChatInputCommandInteraction) {
  const dadJokesTxt = readFileSync("./resources/dadjokes.txt").toString().split("\n");
  const randomNum = Math.floor(Math.random() * 710);

  return interaction.reply({ content: dadJokesTxt[randomNum] });
}
