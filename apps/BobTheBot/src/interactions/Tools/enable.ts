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
import { capitalizeFirst, getCategories, damerAutocomplete } from "../../utils/index.js";

/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires */
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
/* eslint-enable @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires  */

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
    .setName("enable")
    .setDescription("Enables a command or category")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("command")
        .setDescription("Enables a command")
        .addStringOption((option) =>
          option.setName("command").setDescription("The command to enable").setRequired(true).setAutocomplete(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("category")
        .setDescription("Enables a category")
        .addStringOption((option) =>
          option
            .setName("category")
            .setDescription("The category to enable")
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
  async execute(interaction: ChatInputCommandInteraction<"cached">) {
    const subcommand = interaction.options.getSubcommand();

    const guildData = await GuildModel.findOne({
      guildId: interaction.guild.id,
    });

    if (!guildData) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle(":x: Already enabled!")
            .setDescription(`This command or category is already enabled!`)
            .setFooter({ text: "To save performance, I cannot tell you what you specified" })
            .setColor(Color.DiscordDanger),
        ],
        ephemeral: true,
      });
    }

    switch (subcommand) {
      case "command": {
        let command = interaction.options.getString("command", true);

        const index: number = command.indexOf(":");
        if (index >= 0) command = command.slice(Math.max(0, index + 2)).toLowerCase();

        let cmdEmbed: EmbedBuilder;

        if (!guildData.DisabledCommands.includes(command))
          cmdEmbed = new EmbedBuilder()
            .setTitle(":x: Command already enabled!")
            .setDescription(`Command \`${command}\` is already enabled!`)
            .setColor(Color.DiscordDanger);
        else if (guildData.DisabledCommands.includes(command)) {
          guildData.DisabledCommands = guildData.DisabledCommands.filter((cmd) => cmd !== command);

          await guildData.save();

          cmdEmbed = new EmbedBuilder()
            .setTitle(":white_check_mark: Command enabled!")
            .setDescription(`Command \`${command}\` has been enabled!`)
            .setColor(Color.DiscordSuccess);
        } else {
          cmdEmbed = new EmbedBuilder()
            .setTitle(":x: Something went wrong!")
            .setDescription(`Command \`${command}\` does not exist!`)
            .setColor(Color.DiscordDanger);
        }

        return interaction.reply({
          embeds: [cmdEmbed],
          ephemeral: true,
        });
      }

      case "category": {
        const category = interaction.options.getString("category", true);
        const categories = fs.readdirSync("./dist/interactions");

        let catEmbed;
        if (categories.includes(category)) {
          const interactions = fs.readdirSync(`./dist/interactions/${category}`).filter((file) => file.endsWith(".js"));

          let commandCount = 0;
          const disabledCommandsArray = [];

          for (const file of interactions) {
            // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
            const command = require(`../${category}/${file}`);
            if (guildData.DisabledCommands.includes(command.data.name)) {
              commandCount++;
              disabledCommandsArray.push(command.data.name);
              guildData.DisabledCommands = guildData.DisabledCommands.filter((cmd) => cmd !== command.data.name);
            }
          }

          await guildData.save();

          if (commandCount === 0) {
            catEmbed = new EmbedBuilder()
              .setTitle(":x: No commands were enabled!")
              .setDescription(`All commands in category \`${category}\` are already enabled!`)
              .setColor(Color.DiscordDanger);
          } else {
            catEmbed = new EmbedBuilder()
              .setTitle(`:white_check_mark: Enabled ${commandCount} commands!`)
              .setDescription(`Enabled commands: \`${disabledCommandsArray.join("`, `")}\``)
              .setColor(Color.DiscordSuccess);
          }
        } else {
          catEmbed = new EmbedBuilder()
            .setTitle(":x: Unknown category!")
            .setDescription(`Category \`${category}\` does not exist!`)
            .setColor(Color.DiscordDanger);
        }

        return interaction.reply({
          embeds: [catEmbed],
          ephemeral: true,
        });
      }

      default:
        return interaction.reply({
          content: ":x: Unknown subcommand!",
          ephemeral: true,
        });
    }
  },
  requiredBotPerms,
  requiredUserPerms,
};
