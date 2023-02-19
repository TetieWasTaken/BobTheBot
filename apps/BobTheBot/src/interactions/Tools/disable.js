const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const GuildSchema = require("../../models/GuildModel");
const fs = require("fs");

const requiredBotPerms = {
  type: "flags",
  key: [],
};

const requiredUserPerms = {
  type: "flags",
  key: [PermissionFlagsBits.Administrator],
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
          option.setName("command").setDescription("The command to disable").setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("category")
        .setDescription("Disables a category")
        .addStringOption((option) =>
          option.setName("category").setDescription("The category to disable").setRequired(true)
        )
    ),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    let guildData = await GuildSchema.findOne({
      guildId: interaction.guild.id,
    });

    if (!guildData) {
      guildData = new GuildSchema({
        GuildId: interaction.guild.id,
        DisabledCommands: [],
      });
    }

    if (!guildData.DisabledCommands) {
      guildData.DisabledCommands = [];
    }

    switch (subcommand) {
      case "command": {
        const command = interaction.options.getString("command");
        const commandFile = interaction.client.interactions.get(command);

        let cmdEmbed;

        if (!commandFile) {
          cmdEmbed = new EmbedBuilder()
            .setTitle(":x: Command not found")
            .setDescription(`Command \`${command}\` does not exist!`)
            .setColor(0xed4245);
        } else if (command == "disable" || command == "enable") {
          cmdEmbed = new EmbedBuilder()
            .setTitle(":x: Unable to disable command")
            .setDescription(`Command \`${command}\` cannot be disabled or enabled!`)
            .setColor(0xed4245);
        } else if (guildData.DisabledCommands.includes(command)) {
          cmdEmbed = new EmbedBuilder()
            .setTitle(":x: Command already disabled")
            .setDescription(`Command \`${command}\` is already disabled!`)
            .setColor(0xed4245);
        } else {
          guildData.DisabledCommands.push(command);
          await guildData.save();

          cmdEmbed = new EmbedBuilder()
            .setTitle(":white_check_mark: Command Disabled")
            .setDescription(`Command \`${command}\` has been disabled!`)
            .setColor("0x57f287");
        }

        interaction.reply({ embeds: [cmdEmbed], ephemeral: true });

        break;
      }
      case "category": {
        const category = interaction.options.getString("category");
        const categories = fs.readdirSync("./interactions");

        for (let cat in categories) {
          categories[cat] = categories[cat].toLowerCase();
        }

        if (!categories.includes(category.toLowerCase())) {
          return interaction.reply({
            content: `:x: Category \`${category}\` does not exist!`,
            ephemeral: true,
          });
        }

        let commandCount = 0;
        let disabledCommandsArray = [];

        const interactions = fs.readdirSync(`./interactions/${category}`).filter((file) => file.endsWith(".js"));

        for (const file of interactions) {
          const command = require(`../${category}/${file}`);
          const commandFile = interaction.client.interactions.get(command.data.name);
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
            .setColor(0xed4245);
        } else {
          catEmbed = new EmbedBuilder()
            .setTitle(`:white_check_mark: Disabled ${commandCount} interactions!`)
            .setDescription(`Disabled interactions: \`${disabledCommandsArray.join("`, `")}\``)
            .setColor(0x57f287);
        }

        interaction.reply({
          embeds: [catEmbed],
          ephemeral: true,
        });
        break;
      }
      default:
        return interaction.reply({
          content: "Unknown subcommand!",
          ephemeral: true,
        });
    }
  },
  requiredBotPerms: requiredBotPerms,
  requiredUserPerms: requiredUserPerms,
};