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
  data: new SlashCommandBuilder().setName("dadjoke").setDescription("Receive a random dad joke!"),
  async execute(interaction: ChatInputCommandInteraction) {
    const dadJokesTxt = fs.readFileSync("./resources/dadjokes.txt").toString().split("\n");
    const randomNum = Math.floor(Math.random() * 710);

    interaction.reply({ content: dadJokesTxt[randomNum] });
  },
  requiredBotPerms: requiredBotPerms,
  requiredUserPerms: requiredUserPerms,
};
