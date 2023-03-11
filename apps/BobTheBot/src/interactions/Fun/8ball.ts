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
  data: new SlashCommandBuilder()
    .setName("8ball")
    .setDescription("Ask the magic 8ball a question")
    .addStringOption((option: any) =>
      option.setName("question").setDescription("The question to ask").setRequired(true)
    )
    .setDMPermission(true),
  async execute(interaction: ChatInputCommandInteraction<"cached">) {
    const eightballTxt = fs.readFileSync("./resources/8ballresponses.txt").toString().split("\n");
    const randomNum = Math.floor(Math.random() * 20);

    return interaction.reply({
      content: `\`${interaction.options.getString("question")}\`\n:8ball: ${eightballTxt[randomNum]}`,
      ephemeral: true,
    });
  },
  requiredBotPerms,
  requiredUserPerms,
};
