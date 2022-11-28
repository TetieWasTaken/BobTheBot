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

    let roleColor = "ffffff";
    const member = interaction.guild.members.cache.get(
      interaction.client.user.id
    );
    const roleCacheSize = member.roles.cache.size;
    if (roleCacheSize >= 2) {
      if (member.roles.color !== null) {
        roleColor = member.roles.color.hexColor;
      }
    }

    const replyEmbed = new EmbedBuilder()
      .setColor(roleColor)
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
