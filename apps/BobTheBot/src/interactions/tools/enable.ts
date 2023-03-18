import { fileURLToPath, URL } from "node:url";
import {
  PermissionFlagsBits,
  EmbedBuilder,
  type AutocompleteInteraction,
  type ChatInputCommandInteraction,
  ApplicationCommandOptionType,
} from "discord.js";
import readdirp from "readdirp";
import { Color } from "../../constants.js";
import { GuildModel } from "../../models/index.js";
import {
  permissionToString,
  getCommands,
  damerAutocomplete,
  type ChatInputCommand,
  getCategories,
  getCommandData,
} from "../../utils/index.js";

export const RequiredPerms = {
  bot: [],
  user: [PermissionFlagsBits.Administrator],
} as const;

export const EnableCommand: ChatInputCommand = {
  name: "enable",
  description: "Enable a command or module",
  options: [
    {
      name: "command",
      description: "The command to enable",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "command",
          description: "The command to enable",
          type: ApplicationCommandOptionType.String,
          required: true,
          autocomplete: true,
        },
      ],
    },
    {
      name: "category",
      description: "The category to enable",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "category",
          description: "The category to enable",
          type: ApplicationCommandOptionType.String,
          choices: [...getCategories()],
          required: true,
        },
      ],
    },
  ],
  default_member_permissions: permissionToString(RequiredPerms.user),
  dm_permission: false,
} as const;

export async function autocomplete(interaction: AutocompleteInteraction) {
  const query = interaction.options.getFocused();
  const choices = await getCommands();

  await interaction.respond(damerAutocomplete(query, choices));
}

export async function execute(interaction: ChatInputCommandInteraction<"cached">) {
  const subcommand = interaction.options.getSubcommand();

  const guildData = await GuildModel.findOne({
    guildId: interaction.guild.id,
  });

  if (!guildData) {
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("❌ Already enabled!")
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
          .setTitle("❌ Command already enabled!")
          .setDescription(`Command \`${command}\` is already enabled!`)
          .setColor(Color.DiscordDanger);
      else if (guildData.DisabledCommands.includes(command)) {
        guildData.DisabledCommands = guildData.DisabledCommands.filter((cmd) => cmd !== command);

        await guildData.save();

        cmdEmbed = new EmbedBuilder()
          .setTitle("✅ Command enabled!")
          .setDescription(`Command \`${command}\` has been enabled!`)
          .setColor(Color.DiscordSuccess);
      } else {
        cmdEmbed = new EmbedBuilder()
          .setTitle("❌ Something went wrong!")
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

      let commandCount = 0;
      const disabledCommandsArray = [];

      for await (const dir of readdirp(
        fileURLToPath(new URL(/.*dist\/interactions\//.exec(import.meta.url)!.toString())),
        {
          fileFilter: ["*.js"],
        }
      )) {
        const commandName = getCommandData(dir.path);

        if (guildData.DisabledCommands.includes(commandName)) {
          commandCount++;
          disabledCommandsArray.push(commandName);
          guildData.DisabledCommands = guildData.DisabledCommands.filter((cmd) => cmd !== commandName);
        }
      }

      await guildData.save();

      const catEmbed = new EmbedBuilder();

      if (commandCount === 0) {
        catEmbed
          .setTitle("❌ No commands were enabled!")
          .setDescription(`All commands in category \`${category}\` are already enabled!`)
          .setColor(Color.DiscordDanger);
      } else {
        catEmbed
          .setTitle(`✅ Enabled ${commandCount} commands!`)
          .setDescription(`Enabled commands: \`${disabledCommandsArray.join("`, `")}\``)
          .setColor(Color.DiscordSuccess);
      }

      return interaction.reply({
        embeds: [catEmbed],
        ephemeral: true,
      });
    }
  }
}
