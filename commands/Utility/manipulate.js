const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits } = require("discord.js");

const requiredPerms = {
  type: "flags",
  key: [PermissionFlagsBits.SendMessages],
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("manipulate")
    .setDescription("Manipulates text")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("reverse")
        .setDescription("Reverse text")
        .addStringOption((option) =>
          option
            .setName("input")
            .setDescription("Text to reverse")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("ascii")
        .setDescription("Convert text to ASCII")
        .addStringOption((option) =>
          option
            .setName("input")
            .setDescription("Text to convert")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("vowel")
        .setDescription("Remove vowels from text")
        .addStringOption((option) =>
          option
            .setName("input")
            .setDescription("Text to remove vowels from")
            .setRequired(true)
        )
    ),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const text = interaction.options.getString("input");

    switch (subcommand) {
      case "reverse":
        return interaction.reply({
          content: `${text.split("").reverse().join("")}`,
          ephemeral: true,
        });
      case "ascii":
        return interaction.reply({
          content: `${text
            .split("")
            .map((c) => c.charCodeAt(0))
            .join(" ")}`,
          ephemeral: true,
        });
      case "vowel":
        return interaction.reply({
          content: `${text.replace(/[aeiou]/gi, "")}`,
          ephemeral: true,
        });
      default:
        return interaction.reply({
          content: "Unknown subcommand",
          ephemeral: true,
        });
    }
  },
  requiredPerms: requiredPerms,
};
