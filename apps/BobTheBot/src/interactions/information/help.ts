import fs from "node:fs";
import {
  EmbedBuilder,
  PermissionsBitField,
  ApplicationCommandOptionType,
  type AutocompleteInteraction,
  type ChatInputCommandInteraction,
  type Collection,
  type Snowflake,
  type ApplicationCommand,
} from "discord.js";
import { Color } from "../../constants.js";
import {
  damerAutocomplete,
  permissionToString,
  capitalizeFirst,
  getCategories,
  getCommands,
  type ChatInputCommand,
  type ExtendedClient,
} from "../../utils/index.js";

export const RequiredPerms = {
  bot: [],
  user: [],
} as const;

export const HelpCommand: ChatInputCommand = {
  name: "help",
  description: "Shows a list of all commands or information about a specific command",
  options: [
    {
      name: "category",
      description: "Get help for a specific category",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "category",
          description: "The category to get help for",
          type: ApplicationCommandOptionType.String,
          required: true,
          choices: [...getCategories()],
        },
      ],
    },
    {
      name: "command",
      description: "Get help for a specific command",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "command",
          description: "The command to get help for",
          type: ApplicationCommandOptionType.String,
          required: true,
          autocomplete: true,
        },
      ],
    },
  ],
  default_member_permissions: permissionToString(RequiredPerms.user),
  dm_permission: true,
} as const;

/**
 * Checks if the bot has the specified permission
 *
 * @param perm - The permission to check
 * @param interaction - The interaction to check the permission for
 * @returns A string with a "+" if the bot has the permission, or a "-" if it doesn't
 */
function getBotPerms(perm: bigint, interaction: ChatInputCommandInteraction<"cached">) {
  return interaction.guild.members.me?.permissions.has(perm) ? "+" : "-";
}

/**
 * Checks if the user has the specified permission
 *
 * @param perm - The permission to check
 * @param interaction - The interaction to check the permission for
 * @returns A string with a "+" if the bot has the permission, or a "-" if it doesn't
 */
function getUserPerms(perm: bigint, interaction: ChatInputCommandInteraction<"cached">) {
  return interaction.member.permissions.has(perm) ? "+" : "-";
}

export async function autocomplete(interaction: AutocompleteInteraction) {
  const query = interaction.options.getFocused();
  const choices = await getCommands();

  await interaction.respond(damerAutocomplete(query, choices));
}

export async function execute(interaction: ChatInputCommandInteraction<"cached">, client: ExtendedClient) {
  switch (interaction.options.getSubcommand()) {
    case "category": {
      const category = interaction.options.getString("category", true);

      const catEmbed = new EmbedBuilder()
        .setAuthor({ name: category })
        .setColor(Color.DiscordSuccess)
        .setTitle(`Help for ${category}`);

      const categoryCommands = fs.readdirSync(`./dist/interactions/${category}`).filter((file) => file.endsWith(".js"));

      const descriptionArray = [];

      if (!client.application) return;

      const commands: Collection<Snowflake, ApplicationCommand> = await client.application.commands.fetch();

      for (const file of categoryCommands) {
        const commandName = `${capitalizeFirst(file.split(".")[0]!)}Command`;

        const command = await import(`../${category}/${file}`);

        const commandData: ChatInputCommand = command[commandName];
        if (!commandData) continue;

        const commandId = commands.find(
          (applicationCommand: ApplicationCommand) => applicationCommand.name === commandData.name
        )?.id as string;

        descriptionArray.push(`</${commandData.name}:${commandId}> - ${commandData.description}`);
      }

      catEmbed.setDescription(descriptionArray.join("\n"));

      return interaction.reply({ embeds: [catEmbed] });
    }

    case "command": {
      const query = interaction.options.getString("command");
      if (!query) return interaction.reply({ content: "Unable to load query", ephemeral: true });

      const commandRegExp = /^.*(?=(?<colon>:))/g;
      const commandQuery = query.replaceAll(commandRegExp, "").trim().toLowerCase().slice(2);

      const command = client.interactions.get(commandQuery);

      if (!command) {
        return interaction.reply({
          content: `Command \`${commandQuery}\` not found.`,
        });
      }

      const commandName = `${capitalizeFirst(commandQuery)}Command`;

      const commandData: ChatInputCommand = command[commandName];

      if (!commandData) {
        return interaction.reply({
          content: `Command \`${commandQuery}\` not found.`,
        });
      }

      const embed = new EmbedBuilder()
        .setAuthor({
          name: capitalizeFirst(commandQuery),
        })
        .setColor(Color.DiscordSuccess)
        .setTitle(`Help for ${capitalizeFirst(commandQuery)}`)
        .setDescription(commandData.description)
        .addFields({ name: "Usage", value: `\`/${commandData.name}\`` });

      if (commandData.options && commandData.options.length > 0) {
        let optionsString = "";
        if (commandData.options[0] && Object.hasOwn(commandData.options[0], "options")) {
          optionsString = commandData.options
            .map((subcommand) => {
              if (subcommand.options)
                return (
                  `\`${subcommand.name}\` - ${subcommand.description}\n` +
                  `↳${subcommand.options
                    .map((option) => {
                      return `    \`${option.name}\` - ${option.description}`;
                    })
                    .join("\n↳")}`
                );
              else return `\`${subcommand.name}\` - ${subcommand.description}`;
            })
            .join("\n\n");
        } else {
          optionsString = commandData.options
            .map((option) => {
              return `\`${option.name}\` - ${option.description}`;
            })
            .join("\n");
        }

        embed.addFields({
          name: "Options",
          value: optionsString,
        });
      }

      const botPermsArray = [];
      const userPermsArray = [];
      let hasPerm;

      for (const perm of command.RequiredPerms.bot) {
        hasPerm = getBotPerms(perm, interaction);
        botPermsArray.push(`${hasPerm} ${new PermissionsBitField(perm).toArray()}}`);
      }

      for (const perm of command.RequiredPerms.user) {
        hasPerm = getUserPerms(perm, interaction);
        userPermsArray.push(`${hasPerm} ${new PermissionsBitField(perm).toArray()}`);
      }

      if (botPermsArray.length > 0) {
        embed.addFields({
          name: "Bot Permissions",
          value: `I require the following permissions for this command:\n\`\`\`diff\n${botPermsArray.join("\n")}\`\`\``,
        });
      }

      if (userPermsArray.length > 0) {
        embed.addFields({
          name: "User Permissions",
          value: `You require the following permissions for this command:\n\`\`\`diff\n${userPermsArray.join(
            "\n"
          )}\`\`\``,
        });
      }

      return interaction.reply({ embeds: [embed] });
    }

    default: {
    }
  }
}
