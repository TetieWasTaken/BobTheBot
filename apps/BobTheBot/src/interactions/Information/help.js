const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, PermissionsBitField } = require("discord.js");
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
    .readdirSync("./src/interactions")
    .filter((item) => !/(^|\/)\.[^/.]/g.test(item))
    .filter((item) => item !== "context-menu");

  return choises.map((choice) => {
    return { name: choice, value: choice };
  });
}

function getCommands() {
  const categories = fs
    .readdirSync("./src/interactions")
    .filter((item) => !/(^|\/)\.[^/.]/g.test(item))
    .filter((item) => item !== "context-menu");

  const interactions = [];

  for (let category of categories) {
    const commandFiles = fs.readdirSync(`./src/interactions/${category}`).filter((file) => file.endsWith(".js"));

    for (let file of commandFiles) {
      category = capitalizeFirst(category);

      let commandName = require(`../${category}/${file}`);
      commandName = commandName.data.name;
      commandName = capitalizeFirst(commandName);
      interactions.push(`${category}: ${commandName}`);
    }
  }

  return interactions;
}

function getBotPerms(perm, i) {
  return i.guild.members.me.permissions.has(perm) ? "+ " : "- ";
}

function getUserPerms(perm, i) {
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

    const choicesRegExp = /^.*(?=(:))/g;

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

    let response = finalChoices.map((choice) => ({ name: choice, value: choice }));

    if (response.length >= 15) {
      response = response.slice(0, 15);
    }

    await interaction.respond(response);
  },
  async execute(interaction) {
    switch (interaction.options.getSubcommand()) {
      case "category": {
        const category = interaction.options.getString("category");

        let catEmbed = new EmbedBuilder()
          .setAuthor({ name: category })
          .setColor(0x57f287)
          .setTitle(`Help for ${category}`);

        const categoryCommands = fs.readdirSync(`./interactions/${category}`).filter((file) => file.endsWith(".js"));

        let descriptionArray = [];

        for (let file of categoryCommands) {
          let command = require(`../${category}/${file}`);

          descriptionArray.push(`\`/${command.data.name}\` - ${command.data.description}`);
        }

        catEmbed.setDescription(descriptionArray.join("\n"));

        await interaction.reply({ embeds: [catEmbed] });
        break;
      }
      case "command": {
        const query = interaction.options.getString("query");
        const commandRegExp = /^.*(?=(:))/g;
        const commandQuery = query.replace(commandRegExp, "").trim().toLowerCase().slice(2);

        const command = interaction.client.interactions.get(commandQuery);

        if (!command) {
          return interaction.reply({
            content: `Command \`${commandQuery}\` not found.`,
          });
        }

        const embed = new EmbedBuilder()
          .setAuthor({
            name: capitalizeFirst(commandQuery),
          })
          .setColor(0x57f287)
          .setTitle(`Help for ${capitalizeFirst(commandQuery)}`)
          .setDescription(command.data.description)
          .addFields({ name: "Usage", value: `\`/${command.data.name}\`` });

        if (command.data.options.length > 0) {
          let optionsString = "";
          if (Object.prototype.hasOwnProperty.call(command.data.options[0], "options")) {
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

        await interaction.reply({ embeds: [embed] });
        break;
      }
    }
  },
  requiredBotPerms: requiredBotPerms,
  requiredUserPerms: requiredUserPerms,
};