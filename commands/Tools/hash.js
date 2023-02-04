const { SlashCommandBuilder } = require("@discordjs/builders");
const { createHash, scryptSync, randomBytes } = require("crypto");
const { PermissionFlagsBits } = require("discord.js");

const requiredPerms = {
  type: "flags",
  key: [PermissionFlagsBits.SendMessages],
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("hash")
    .setDescription("Hash a custom string")
    .addStringOption((option) =>
      option
        .setName("string")
        .setDescription("The string to hash")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("algorithm")
        .setDescription("The algorithm to use")
        .setRequired(true)
        .addChoices(
          { name: "SHA-256", value: "sha256" },
          { name: "SHA-512", value: "sha512" },
          { name: "MD5 (not recommended)", value: "MD5" },
          { name: "salt", value: "salt" }
        )
        .setMaxLength(128)
    ),
  cooldownTime: 15 * 1000,
  async execute(interaction) {
    let input = interaction.options.getString("string");
    const algorithm = interaction.options.getString("algorithm");

    let string = input;

    switch (algorithm) {
      case "sha256":
        string = createHash("sha256").update(string).digest("hex");
        break;
      case "sha512":
        string = createHash("sha512").update(string).digest("hex");
        break;
      case "MD5":
        string = createHash("md5").update(string).digest("hex");
        break;
      case "salt":
        const salt = randomBytes(16).toString("hex");
        string = scryptSync(string, salt, 64).toString("hex");
    }
    interaction.reply({
      content: `\`${input}\` --> **${algorithm}** --> \`${string}\``,
      ephemeral: true,
    });
  },
  requiredPerms: requiredPerms,
};
