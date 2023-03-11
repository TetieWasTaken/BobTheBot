import fs from "node:fs";
import { SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";

const requiredBotPerms = {
  type: "flags" as const,
  key: [] as const,
};

const requiredUserPerms = {
  type: "flags" as const,
  key: [] as const,
};

module.exports = {
  data: new SlashCommandBuilder().setName("dadjoke").setDescription("Receive a random dad joke!").setDMPermission(true),
  async execute(interaction: ChatInputCommandInteraction<"cached">) {
    const dadJokesTxt = fs.readFileSync("./resources/dadjokes.txt").toString().split("\n");
    const randomNum = Math.floor(Math.random() * 710);

    return interaction.reply({ content: dadJokesTxt[randomNum] });
  },
  requiredBotPerms,
  requiredUserPerms,
};
