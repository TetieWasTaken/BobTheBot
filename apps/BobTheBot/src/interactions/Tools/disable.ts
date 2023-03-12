import fs from "node:fs";
import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  type ChatInputCommandInteraction,
  type AutocompleteInteraction,
} from "discord.js";
import { Color } from "../../constants.js";
import { GuildModel } from "../../models/index.js";
import { damerAutocomplete, capitalizeFirst, getCategories, type ExtendedClient } from "../../utils/index.js";

/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires */

/**
 * @returns A list of all the commands in an array formatted for the autocomplete interaction
 * @example
 * ```
 * const commands = getCommands();
 * console.log(commands); // ["Information: Avatar", "Information: Botinfo", etc..]
 * ```
 */
function getCommands() {
  const categories = fs
    .readdirSync("./dist/interactions")
    .filter((item) => !/(?:^|\/)\.[^./]/g.test(item) && item !== "context-menu");

  return categories.flatMap((category) =>
    fs
      .readdirSync(`./dist/interactions/${category}`)
      .filter((file) => file.endsWith(".js"))
      .map((file) => `${capitalizeFirst(category)}: ${capitalizeFirst(require(`../${category}/${file}`).data.name)}`)
  );
}

const requiredBotPerms = {
  type: "flags" as const,
  key: [] as const,
};

const requiredUserPerms = {
  type: "flags" as const,
  key: [PermissionFlagsBits.Administrator] as const,
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("disable")
    .setDescription("Disables a command or category")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("command")
        .setDescription("Disables a command")
        .addStringOption((option) =>
          option.setName("command").setDescription("The command to disable").setRequired(true).setAutocomplete(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("category")
        .setDescription("Disables a category")
        .addStringOption((option) =>
          option
            .setName("category")
            .setDescription("The category to disable")
            .setRequired(true)
            .addChoices(...getCategories())
        )
    )
    .setDefaultMemberPermissions(...requiredUserPerms.key)
    .setDMPermission(false),
  async autocomplete(interaction: AutocompleteInteraction<"cached">) {
    const query = interaction.options.getFocused();
    const choices = getCommands();

    await interaction.respond(damerAutocomplete(query, choices));
  },
  async execute(interaction: ChatInputCommandInteraction<"cached">, client: ExtendedClient) {
    const subcommand = interaction.options.getSubcommand();

    let guildData = await GuildModel.findOne({
      guildId: interaction.guild.id,
    });

    if (!guildData) {
      guildData = new GuildModel({
        GuildId: interaction.guild.id,
        DisabledCommands: [],
      });
    }

    if (!guildData.DisabledCommands) {
      guildData.DisabledCommands = [];
    }

    switch (subcommand) {
      case "command": {
        let command = interaction.options.getString("command", true);

        const index: number = command.indexOf(":");
        if (index >= 0) command = command.slice(Math.max(0, index + 2)).toLowerCase();

        let cmdEmbed: EmbedBuilder;

        if (command === "disable" || command === "enable") {
          cmdEmbed = new EmbedBuilder()
            .setTitle(":x: Unable to disable command")
            .setDescription(`Command \`${command}\` cannot be disabled or enabled!`)
            .setColor(Color.DiscordDanger);
        } else if (guildData.DisabledCommands.includes(command)) {
          cmdEmbed = new EmbedBuilder()
            .setTitle(":x: Command already disabled")
            .setDescription(`Command \`${command}\` is already disabled!`)
            .setColor(Color.DiscordDanger);
        } else {
          guildData.DisabledCommands.push(command);
          await guildData.save();

          cmdEmbed = new EmbedBuilder()
            .setTitle(":white_check_mark: Command Disabled")
            .setDescription(`Command \`${command}\` has been disabled!`)
            .setColor(Color.DiscordSuccess);
        }

        await interaction.reply({ embeds: [cmdEmbed], ephemeral: true });
        break;
      }

      case "category": {
        const category = interaction.options.getString("category", true);

        let commandCount = 0;
        const disabledCommandsArray = [];

        const interactions = fs.readdirSync(`./dist/interactions/${category}`).filter((file) => file.endsWith(".js"));

        for (const file of interactions) {
          const command = require(`../${category}/${file}`);
          const commandFile = client.interactions.get(command.data.name);
          if (commandFile) {
            if (guildData.DisabledCommands.includes(command.data.name)) {
              continue;
            }

            commandCount++;
            disabledCommandsArray.push(command.data.name);
            guildData.DisabledCommands.push(command.data.name);
          }
        }

        await guildData.save();

        let catEmbed;

        if (commandCount === 0) {
          catEmbed = new EmbedBuilder()
            .setTitle(":x: No interactions were disabled!")
            .setDescription(`All interactions in category \`${category}\` are already disabled!`)
            .setColor(Color.DiscordDanger);
        } else {
          catEmbed = new EmbedBuilder()
            .setTitle(`:white_check_mark: Disabled ${commandCount} interactions!`)
            .setDescription(`Disabled interactions: \`${disabledCommandsArray.join("`, `")}\``)
            .setColor(Color.DiscordSuccess);
        }

        return interaction.reply({
          embeds: [catEmbed],
          ephemeral: true,
        });
      }

      default:
        return interaction.reply({
          content: "Unknown subcommand!",
          ephemeral: true,
        });
    }
  },
  requiredBotPerms,
  requiredUserPerms,
};
