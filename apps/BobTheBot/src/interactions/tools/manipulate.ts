import { ApplicationCommandOptionType, EmbedBuilder, type ChatInputCommandInteraction } from "discord.js";
import { Color } from "../../constants.js";
import { permissionToString, type ChatInputCommand } from "../../utils/index.js";

export const RequiredPerms = {
  bot: [],
  user: [],
} as const;

export const ManipulateCommand: ChatInputCommand = {
  name: "manipulate",
  description: "Manipulate a string",
  options: [
    {
      name: "reverse",
      description: "Reverse a string",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "string",
          description: "The string to reverse",
          type: ApplicationCommandOptionType.String,
          required: true,
        },
      ],
    },
    {
      name: "ascii",
      description: "Convert a string to ascii",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "string",
          description: "The string to convert",
          type: ApplicationCommandOptionType.String,
          required: true,
        },
      ],
    },
    {
      name: "vowel",
      description: "Remove all vowels from a string",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "string",
          description: "The string to remove vowels from",
          type: ApplicationCommandOptionType.String,
          required: true,
        },
      ],
    },
    {
      name: "1337",
      description: "Convert a string to 1337 (leet)",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "string",
          description: "The string to convert",
          type: ApplicationCommandOptionType.String,
          required: true,
        },
      ],
    },
  ],
  default_member_permissions: permissionToString(RequiredPerms.user),
  dm_permission: true,
} as const;

export async function execute(interaction: ChatInputCommandInteraction) {
  const subcommand = interaction.options.getSubcommand();
  const text = interaction.options.getString("string", true);

  const replyEmbed = new EmbedBuilder()
    .setAuthor({ name: `Manipulate • ${subcommand}` })
    .setColor(Color.DiscordEmbedBackground)
    .addFields({ name: "INPUT", value: `\`\`\`fix\n${text}\`\`\``, inline: false });

  let output = "";

  switch (subcommand) {
    case "reverse":
      output = text.split("").reverse().join("");
      break;
    case "ascii":
      output = text
        .split("")
        .map((char) => char.codePointAt(0))
        .join(" ");
      break;
    case "vowel":
      output = text.replaceAll(/[aeiou]/gi, "").replaceAll(/\s\s+/g, " ");
      break;
    case "1337": {
      output = text
        .replaceAll(/a/gi, "4")
        .replaceAll(/e/gi, "3")
        .replaceAll(/i/gi, "1")
        .replaceAll(/o/gi, "0")
        .replaceAll(/s/gi, "5")
        .replaceAll(/t/gi, "7");
      break;
    }

    default:
      return interaction.reply({
        content: "Unknown subcommand",
        ephemeral: true,
      });
  }

  replyEmbed.addFields({ name: "OUTPUT", value: `\`\`\`fix\n${output}\`\`\``, inline: false });

  return interaction.reply({ embeds: [replyEmbed] });
}
