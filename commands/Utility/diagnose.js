const { SlashCommandBuilder } = require("@discordjs/builders");
const fs = require("fs");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("diagnose")
    .setDescription("Diagnose all commands and events"),
  async execute(interaction) {
    let commandArray = [];

    const commandFolders = fs
      .readdirSync("./commands/")
      .filter((item) => !/(^|\/)\.[^/.]/g.test(item));
    for (const folder of commandFolders) {
      const commandFiles = fs
        .readdirSync(`./commands/${folder}`)
        .filter((file) => file.endsWith(".js"));
      for (const file of commandFiles) {
        commandArray.push(`✅ ${file}`);
      }
    }
    if (commandArray.length == 0) {
      commandArray.push("❌ Commands failed to load");
    }

    const replyEmbed = new EmbedBuilder()
      .setColor(0xffffff)
      .setTitle(`Diagnose results`)
      .addFields({
        name: `Commands`,
        value: commandArray.join("\n"),
        inline: true,
      })
      .setTimestamp();

    interaction.reply({ embeds: [replyEmbed], ephemeral: true });
  },
};
