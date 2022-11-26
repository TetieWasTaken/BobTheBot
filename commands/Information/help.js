const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Get help from the bot")
    .addStringOption((option) =>
      option
        .setName("category")
        .setDescription("The category of the command to get help for")
        .addChoices(
          { name: "Fun", value: "Fun" },
          { name: "Giveaways", value: "Giveaways" },
          { name: "Information", value: "Information" },
          { name: "Moderation", value: "Moderation" },
          { name: "Utility", value: "Utility" }
        )
        .setRequired(true)
    ),
  async execute(interaction) {
    const category = interaction.options.getString("category");

    let commandArray = [];

    const commandFiles = fs
      .readdirSync(`./commands/${category}`)
      .filter((file) => file.endsWith(".js"));
    for (const file of commandFiles) {
      commandArray.push(`${file}`);
    }

    commandArray = commandArray.map(function (d) {
      return d.replace(".js", "");
    });

    const userDM = new EmbedBuilder()
      .setColor(0xffffff)
      .setTitle(`${category}`)
      .addFields({
        name: `Commands in ${category}`,
        value: commandArray.join("\n"),
        inline: false,
      })
      .setTimestamp();

    interaction.user
      .createDM(true)
      .catch((err) =>
        interaction.reply({ content: `An error occured: \`${err}\`` })
      );
    interaction.user
      .send({ embeds: [userDM] })
      .catch((err) =>
        interaction.reply({ content: `An error occured: \`${err}\`` })
      );
    interaction.reply({
      content: `Please check your Direct Messages!`,
      ephemeral: true,
    });
  },
};
