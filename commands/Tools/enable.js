const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
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
    .setName("enable")
    .setDescription("Enables a command or category")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("command")
        .setDescription("Enables a command")
        .addStringOption((option) =>
          option
            .setName("command")
            .setDescription("The command to enable")
            .setRequired(true)
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
        )
    ),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    let guildData = await GuildSchema.findOne({
      guildId: interaction.guild.id,
    });

    switch (subcommand) {
      case "command":
        const command = interaction.options.getString("command");
        const commandFile = interaction.client.commands.get(command);

        let cmdEmbed;

        if (!commandFile) {
          cmdEmbed = new EmbedBuilder()
            .setTitle(":x: Command not found!")
            .setDescription(`Command \`${command}\` does not exist!`)
            .setColor("#FF0000");
        } else if (!guildData.DisabledCommands.includes(command)) {
          cmdEmbed = new EmbedBuilder()
            .setTitle(":x: Command already enabled!")
            .setDescription(`Command \`${command}\` is already enabled!`)
            .setColor("#FF0000");
        } else {
          guildData.DisabledCommands = guildData.DisabledCommands.filter(
            (cmd) => cmd !== command
          );

          await guildData.save();

          cmdEmbed = new EmbedBuilder()
            .setTitle(":white_check_mark: Command enabled!")
            .setDescription(`Command \`${command}\` has been enabled!`)
            .setColor("#00FF00");
        }

        interaction.reply({
          embeds: [cmdEmbed],
          ephemeral: true,
        });
        break;
      case "category":
        const category = interaction.options.getString("category");
        const categories = fs.readdirSync("./commands");

        let catEmbed;
        if (categories.includes(category)) {
          const commands = fs
            .readdirSync(`./commands/${category}`)
            .filter((file) => file.endsWith(".js"));

          let commandCount = 0;
          let disabledCommandsArray = [];

          for (const file of commands) {
            const command = require(`../${category}/${file}`);
            if (guildData.DisabledCommands.includes(command.data.name)) {
              commandCount++;
              disabledCommandsArray.push(command.data.name);
              guildData.DisabledCommands = guildData.DisabledCommands.filter(
                (cmd) => cmd !== command.data.name
              );
            }
          }

          await guildData.save();

          if (commandCount === 0) {
            catEmbed = new EmbedBuilder()
              .setTitle(":x: No commands were enabled!")
              .setDescription(
                `All commands in category \`${category}\` are already enabled!`
              )
              .setColor(0xff0000);
          } else {
            catEmbed = new EmbedBuilder()
              .setTitle(`:white_check_mark: Enabled ${commandCount} commands!`)
              .setDescription(
                `Enabled commands: \`${disabledCommandsArray.join("`, `")}\``
              )
              .setColor(0x00ff00);
          }
        } else {
          catEmbed = new EmbedBuilder()
            .setTitle(":x: Unknown category!")
            .setDescription(`Category \`${category}\` does not exist!`)
            .setColor(0xff0000);
        }

        interaction.reply({
          embeds: [catEmbed],
          ephemeral: true,
        });
        break;
      default:
        return interaction.reply({
          content: ":x: Unknown subcommand!",
          ephemeral: true,
        });
    }
  },
  requiredBotPerms: requiredBotPerms,
  requiredUserPerms: requiredUserPerms,
};
