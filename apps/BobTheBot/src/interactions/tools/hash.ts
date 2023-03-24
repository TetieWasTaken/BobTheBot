import { createHash, scryptSync, randomBytes } from "node:crypto";
import { ApplicationCommandOptionType, type ChatInputCommandInteraction } from "discord.js";
import { permissionToString, type ChatInputCommand } from "../../utils/index.js";

export const RequiredPerms = {
  bot: [],
  user: [],
} as const;

export const HashCommand: ChatInputCommand = {
  name: "hash",
  description: "Hashes a string",
  options: [
    {
      name: "string",
      description: "The string to hash",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: "algorithm",
      description: "The algorithm to use",
      type: ApplicationCommandOptionType.String,
      required: true,
      choices: [
        {
          name: "SHA-256",
          value: "sha256",
        },
        {
          name: "SHA-512",
          value: "sha512",
        },
        {
          name: "MD5",
          value: "md5",
        },
        {
          name: "Scrypt",
          value: "salt",
        },
      ],
    },
  ],

  default_member_permissions: permissionToString(RequiredPerms.user),
  dm_permission: true,
} as const;

export async function execute(interaction: ChatInputCommandInteraction) {
  const input = interaction.options.getString("string", true);
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
  } catch (error) {
    return interaction.reply({
      content: `An error occured while hashing the string: \`${error}\``,
      ephemeral: true,
    });
  }

  return interaction.reply({
    content: `\`${input}\` --> **${algorithm}** --> \`${string}\``,
    ephemeral: true,
  });
}
