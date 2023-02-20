const { SlashCommandBuilder } = require("discord.js");
import type { ChatInputCommandInteraction } from "discord.js";
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
    .setName("8ball")
    .setDescription("Ask the magic 8ball a question")
    .addStringOption((option: any) =>
      option.setName("question").setDescription("The question to ask").setRequired(true)
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    const eightballTxt = fs.readFileSync("./resources/8ballresponses.txt").toString().split("\n");
    const randomNum = Math.floor(Math.random() * 20);

    interaction.reply({
      content: `\`${interaction.options.getString("question")}\`\n:8ball: ${eightballTxt[randomNum]}`,
      ephemeral: true,
    });
  },
  requiredBotPerms: requiredBotPerms,
  requiredUserPerms: requiredUserPerms,
};
