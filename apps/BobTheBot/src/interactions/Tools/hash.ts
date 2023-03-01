import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
const { createHash, scryptSync, randomBytes } = require("crypto");

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
    .setName("hash")
    .setDescription("Hash a custom string")
    .addStringOption((option) => option.setName("string").setDescription("The string to hash").setRequired(true))
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
  async execute(interaction: ChatInputCommandInteraction<"cached">) {
    let input = interaction.options.getString("string", true);
    const algorithm = interaction.options.getString("algorithm", true);

    let string = input;

    try {
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
        case "salt": {
          const salt = randomBytes(16).toString("hex");
          string = scryptSync(string, salt, 64).toString("hex");
          break;
        }
      }
    } catch (e) {
      return interaction.reply({
        content: `An error occured while hashing the string: \`${e}\``,
        ephemeral: true,
      });
    }

    return interaction.reply({
      content: `\`${input}\` --> **${algorithm}** --> \`${string}\``,
      ephemeral: true,
    });
  },
  requiredBotPerms: requiredBotPerms,
  requiredUserPerms: requiredUserPerms,
};
