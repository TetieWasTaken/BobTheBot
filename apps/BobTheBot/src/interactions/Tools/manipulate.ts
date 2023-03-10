import { SlashCommandBuilder, EmbedBuilder, type ChatInputCommandInteraction } from "discord.js";
import { Color } from "../../constants.js";

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
    .setName("manipulate")
    .setDescription("Manipulates text")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("reverse")
        .setDescription("Reverse text")
        .addStringOption((option) =>
          option.setName("input").setDescription("Text to reverse").setRequired(true).setMaxLength(1024)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("ascii")
        .setDescription("Convert text to ASCII")
        .addStringOption((option) => option.setName("input").setDescription("Text to convert").setRequired(true))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("vowel")
        .setDescription("Remove vowels from text")
        .addStringOption((option) =>
          option.setName("input").setDescription("Text to remove vowels from").setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("1337")
        .setDescription("Convert text to 1337 (leet)")
        .addStringOption((option) => option.setName("input").setDescription("Text to convert").setRequired(true))
    )
    .setDMPermission(true),
  async execute(interaction: ChatInputCommandInteraction<"cached">) {
    const subcommand = interaction.options.getSubcommand();
    const text = interaction.options.getString("input", true);

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
      case "1337": {
        const embed = new EmbedBuilder()
          .addFields(
            {
              name: "1337 C0NV3R73R",
              value: `\`\`\`fix\nINPUT = ${text}\`\`\``,
              inline: false,
            },
            {
              name: "\u200b",
              value: `\`\`\`fix\n0U7PU7 = ${text
                .replace(/a/gi, "4")
                .replace(/e/gi, "3")
                .replace(/i/gi, "1")
                .replace(/o/gi, "0")
                .replace(/s/gi, "5")
                .replace(/t/gi, "7")}\`\`\``,
              inline: false,
            }
          )
          .setColor(interaction.guild.members.me?.displayHexColor ?? Color.DiscordPrimary);

        return interaction.reply({
          embeds: [embed],
          ephemeral: true,
        });
      }
      default:
        return interaction.reply({
          content: "Unknown subcommand",
          ephemeral: true,
        });
    }
  },
  requiredBotPerms: requiredBotPerms,
  requiredUserPerms: requiredUserPerms,
};
