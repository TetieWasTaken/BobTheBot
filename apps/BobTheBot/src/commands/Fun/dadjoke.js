const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
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
  data: new SlashCommandBuilder().setName("dadjoke").setDescription("Receive a random dad joke!"),
  async execute(interaction) {
    dadJokesTxt = fs.readFileSync("./resources/dadjokes.txt");
    dadJokesTxt = dadJokesTxt.toString();
    dadJokesTxt = dadJokesTxt.split("\n");
    randomNum = Math.floor(Math.random() * 710);

    interaction.reply({ content: dadJokesTxt[randomNum], ephemeral: true });
  },
  requiredBotPerms: requiredBotPerms,
  requiredUserPerms: requiredUserPerms,
};
