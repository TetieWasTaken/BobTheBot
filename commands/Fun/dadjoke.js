const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits } = require("discord.js");
const fs = require("fs");

const requiredPerms = {
  type: "flags",
  key: PermissionFlagsBits.SendMessages,
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("dadjoke")
    .setDescription("Receive a random dad joke!"),
  async execute(interaction) {
    dadJokesTxt = fs.readFileSync("./docs/dadjokes.txt");
    dadJokesTxt = dadJokesTxt.toString();
    dadJokesTxt = dadJokesTxt.split("\n");
    randomNum = Math.floor(Math.random() * 710);

    interaction.reply({ content: dadJokesTxt[randomNum], ephemeral: true });
  },
  requiredPerms: requiredPerms,
};
