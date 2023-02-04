const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  PermissionsBitField,
} = require("discord.js");
const fs = require("fs");
const damerau = require("damerau-levenshtein");
const { capitalizeFirst } = require("../../utils/capitalizeFirst.js");

const requiredBotPerms = {
  type: "flags",
  key: [],
};

const requiredUserPerms = {
  type: "flags",
  key: [],
};

function getChoices() {
  const choises = fs
    .readdirSync("./commands")
    .filter((item) => !/(^|\/)\.[^/.]/g.test(item));

  return choises.map((choice) => {
    return { name: choice, value: choice };
  });
}

function getCommands() {
  const categories = fs
    .readdirSync("./commands")
    .filter((item) => !/(^|\/)\.[^/.]/g.test(item));

  const commands = [];

  for (let category of categories) {
    const commandFiles = fs
      .readdirSync(`./commands/${category}`)
      .filter((file) => file.endsWith(".js"));

    for (let file of commandFiles) {
      category = capitalizeFirst(category);

      let commandName = require(`../${category}/${file}`);
      commandName = commandName.data.name;
      commandName = capitalizeFirst(commandName);
      commands.push(`${category}: ${commandName}`);
    }
  }

  return commands;
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
            .addChoices(...getChoices())
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
  async autocomplete(interaction) {
    const query = interaction.options.getFocused();
    const choices = getCommands();
    let levChoices = [];

    const choicesRegExp = /^.*(?=(\:))/g;

    for (let i = 0; i < choices.length; i++) {
      levChoices.push(choices[i].replace(choicesRegExp, ""));
      levChoices[i] = levChoices[i].trim().toLowerCase().slice(2);
    }

    const filtered = levChoices.filter((choice) => {
      let lev = damerau(choice, query);
      if (query.length > 2) return lev.relative <= 0.75;
      else if (query.length > 1) return lev.relative <= 0.8;
      else return lev.relative <= 1;
    });

    const sorted = filtered.sort((a, b) => {
      let levA = damerau(a, query).relative;
      let levB = damerau(b, query).relative;

      return levA - levB;
    });

    const finalChoices = [];
    for (let i = 0; i < sorted.length; i++) {
      const index = levChoices.indexOf(sorted[i]);
      finalChoices.push(choices[index]);
    }

    response = finalChoices.map((choice) => ({ name: choice, value: choice }));

    if (response.length >= 15) {
      response = response.slice(0, 15);
    }

    await interaction.respond(response);
  },
  async execute(interaction) {
    switch (interaction.options.getSubcommand()) {
      case "category":
        const category = interaction.options.getString("category");

        let catEmbed = new EmbedBuilder()
          .setAuthor({ name: category })
          .setColor(0x00ff00)
          .setTitle(`Help for ${category}`);

        const categoryCommands = fs
          .readdirSync(`./commands/${category}`)
          .filter((file) => file.endsWith(".js"));

        let descriptionArray = [];

        for (let file of categoryCommands) {
          let command = require(`../${category}/${file}`);

          descriptionArray.push(
            `\`/${command.data.name}\` - ${command.data.description}`
          );
        }

        catEmbed.setDescription(descriptionArray.join("\n"));

        await interaction.reply({ embeds: [catEmbed] });
        break;
      case "command":
        const query = interaction.options.getString("query");
        const commandRegExp = /^.*(?=(\:))/g;
        const categoryRegExp = /[^:]*$/g;
        commandQuery = query
          .replace(commandRegExp, "")
          .trim()
          .toLowerCase()
          .slice(2);
        categoryQuery = query
          .replace(categoryRegExp, "")
          .trim()
          .toLowerCase()
          .slice(0, -1);

        console.log(commandQuery, categoryQuery);
        const command = interaction.client.commands.get(commandQuery);

        if (!command) {
          return interaction.reply({
            content: `Command \`${commandQuery}\` not found.`,
          });
        }

        const embed = new EmbedBuilder()
          .setAuthor({
            name: capitalizeFirst(commandQuery),
          })
          .setColor(0x00ff00)
          .setTitle(`Help for ${capitalizeFirst(commandQuery)}`)
          .setDescription(command.data.description)
          .addFields({ name: "Usage", value: `\`/${command.data.name}\`` });

        if (command.data.options.length > 0) {
          let optionsString = "";
          if (command.data.options[0].hasOwnProperty("options")) {
            optionsString = command.data.options
              .map((subcommand) => {
                return (
                  `\`${subcommand.name}\` - ${subcommand.description}\n` +
                  `↳${subcommand.options
                    .map((option) => {
                      return `    \`${option.name}\` - ${option.description}`;
                    })
                    .join("\n↳")}`
                );
              })
              .join("\n\n");
          } else {
            optionsString = command.data.options
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

        if (command.data.defaultPermission === false) {
          embed.addFields({
            name: "Permissions",
            value: "This command is disabled for everyone by default.",
          });
        }

        let permsArray = [];

        function getPerms(perm) {
          return interaction.guild.members.me.permissions.has(perm)
            ? "+ "
            : "- ";
        }

        for (let perm of command.requiredBotPerms.key) {
          hasPerm = getPerms(perm);
          permsArray.push(hasPerm + new PermissionsBitField(perm).toArray());
          if (hasPerm === "- ") {
            embed.setFooter({
              text: "I'm missing permissions to execute this command!",
            });
          }
        }

        if (command.requiredBotPerms) {
          embed.addFields({
            name: "Permissions",
            value: `I require the following permissions for this command:\n\`\`\`diff\n${permsArray.join(
              "\n"
            )}\`\`\``,
          });
        }

        await interaction.reply({ embeds: [embed] });
        break;
    }
  },
  requiredBotPerms: requiredBotPerms,
  requiredUserPerms: requiredUserPerms,
};
