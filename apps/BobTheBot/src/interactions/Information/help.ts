import {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionsBitField,
  ChatInputCommandInteraction,
  AutocompleteInteraction,
  ApplicationCommandSubCommandData,
  ApplicationCommandOptionData,
  ApplicationCommand,
  Collection,
  Snowflake,
} from "discord.js";
import fs from "fs";
import { damerAutocomplete, capitalizeFirst, getCategories, ExtendedClient } from "../../utils/index.js";
import { Color } from "../../constants.js";

const requiredBotPerms = {
  type: "flags" as const,
  key: [] as const,
};

const requiredUserPerms = {
  type: "flags" as const,
  key: [] as const,
};

function getCommands() {
  const categories = fs
    .readdirSync("./dist/interactions")
    .filter((item) => !/(^|\/)\.[^/.]/g.test(item) && item !== "context-menu");

  return categories.flatMap((category) =>
    fs
      .readdirSync(`./dist/interactions/${category}`)
      .filter((file) => file.endsWith(".js"))
      .map((file) => `${capitalizeFirst(category)}: ${capitalizeFirst(require(`../${category}/${file}`).data.name)}`)
  );
}

function getBotPerms(perm: bigint, i: ChatInputCommandInteraction<"cached">) {
  return i.guild.members.me?.permissions.has(perm) ? "+ " : "- ";
}

function getUserPerms(perm: bigint, i: ChatInputCommandInteraction<"cached">) {
  return i.member.permissions.has(perm) ? "+ " : "- ";
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Get help from the bot")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("category")
        .setDescription("Get help for a category")
        .addStringOption((option) =>
          option
            .setName("category")
            .setDescription("The category you want help from")
            .setRequired(true)
            .addChoices(...getCategories())
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("command")
        .setDescription("Get help for a command")
        .addStringOption((option) =>
          option
            .setName("query")
            .setDescription("The command you want help from")
            .setRequired(true)
            .setAutocomplete(true)
        )
    ),
  async autocomplete(interaction: AutocompleteInteraction<"cached">) {
    const query = interaction.options.getFocused();
    const choices = getCommands();

    return await interaction.respond(damerAutocomplete(query, choices));
  },
  async execute(interaction: ChatInputCommandInteraction<"cached">, client: ExtendedClient) {
    switch (interaction.options.getSubcommand()) {
      case "category": {
        const category = interaction.options.getString("category", true);

        let catEmbed = new EmbedBuilder()
          .setAuthor({ name: category })
          .setColor(Color.DiscordSuccess)
          .setTitle(`Help for ${category}`);

        const categoryCommands = fs
          .readdirSync(`./dist/interactions/${category}`)
          .filter((file) => file.endsWith(".js"));

        let descriptionArray = [];

        const commands: Collection<Snowflake, ApplicationCommand> = await client.application.commands.fetch();

        for (let file of categoryCommands) {
          let command = require(`../${category}/${file}`);

          const commandId = commands.find(
            (applicationCommand: ApplicationCommand) => applicationCommand.name === command.data.name
          )?.id as string;

          descriptionArray.push(`</${command.data.name}:${commandId}> - ${command.data.description}`);
        }

        catEmbed.setDescription(descriptionArray.join("\n"));

        return await interaction.reply({ embeds: [catEmbed] });
      }
      case "command": {
        const query = interaction.options.getString("query", true);
        const commandRegExp = /^.*(?=(:))/g;
        const commandQuery = query.replace(commandRegExp, "").trim().toLowerCase().slice(2);

        const command = client.interactions.get(commandQuery);

        if (!command) {
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
          .setDescription(command.data.description)
          .addFields({ name: "Usage", value: `\`/${command.data.name}\`` });

        if (command.data.options.length > 0) {
          let optionsString = "";
          if (Object.prototype.hasOwnProperty.call(command.data.options[0], "options")) {
            optionsString = command.data.options
              .map((subcommand: ApplicationCommandSubCommandData) => {
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
            optionsString = command.data.options
              .map((option: ApplicationCommandOptionData) => {
                return `\`${option.name}\` - ${option.description}`;
              })
              .join("\n");
          }

          embed.addFields({
            name: "Options",
            value: optionsString,
          });
        }

        if (command.data.defaultPermission === false) {
          embed.addFields({
            name: "Permissions",
            value: "This command is disabled for everyone by default.",
          });
        }

        let botPermsArray = [];
        let userPermsArray = [];
        let hasPerm;

        for (let perm of command.requiredBotPerms.key) {
          hasPerm = getBotPerms(perm, interaction);
          botPermsArray.push(hasPerm + new PermissionsBitField(perm).toArray());
        }

        for (let perm of command.requiredUserPerms.key) {
          hasPerm = getUserPerms(perm, interaction);
          userPermsArray.push(hasPerm + new PermissionsBitField(perm).toArray());
        }

        if (botPermsArray.length > 0) {
          embed.addFields({
            name: "Bot Permissions",
            value: `I require the following permissions for this command:\n\`\`\`diff\n${botPermsArray.join(
              "\n"
            )}\`\`\``,
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

        return await interaction.reply({ embeds: [embed] });
      }
      default: {
        return;
      }
    }
  },
  requiredBotPerms: requiredBotPerms,
  requiredUserPerms: requiredUserPerms,
};
