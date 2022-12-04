const { SlashCommandBuilder } = require("@discordjs/builders");
const fs = require("fs");
const {
  EmbedBuilder,
  PermissionsBitField,
  PermissionFlagsBits,
} = require("discord.js");

const requiredPerms = {
  type: "flags",
  key: PermissionFlagsBits.SendMessages,
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("diagnose")
    .setDescription("Diagnose a command")
    .addStringOption((option) =>
      option
        .setName("command")
        .setDescription("The command to diagnose")
        .setRequired(true)
    ),
  async execute(interaction) {
    const command = interaction.options.getString("command");

    if (
      !interaction.channel
        .permissionsFor(interaction.guild.members.me)
        .has(PermissionFlagsBits.SendMessages)
    ) {
      return interaction.user.send(
        ":wrench: I do not have permissions to send messages in the channel!"
      );
    }

    const commandFolders = fs
      .readdirSync("./commands")
      .filter((item) => !/(^|\/)\.[^/.]/g.test(item));
    for (const folder of commandFolders) {
      const commandFiles = fs
        .readdirSync(`./commands/${folder}`)
        .filter((file) => file.endsWith(".js"));
      for (const file of commandFiles) {
        const commandFile = require(`../../commands/${folder}/${file}`);
        if (commandFile.data.name === command) {
          let requiredPerms = require(`../../commands/${folder}/${file}`);
          requiredPerms = requiredPerms.requiredPerms;

          let replyEmbed = new EmbedBuilder();

          if (interaction.guild.members.me.permissions.has(requiredPerms.key)) {
            replyEmbed = new EmbedBuilder()
              .setColor(0x00ff00)
              .setTitle(`Diagnosing ${commandFile.data.name}...`)
              .setDescription(`Everything looks normal.`)
              .setTimestamp();
          } else {
            let missingPermission = new PermissionsBitField(
              requiredPerms.key
            ).toArray();

            replyEmbed = new EmbedBuilder()
              .setColor(0xff0000)
              .setTitle(`Diagnosing ${commandFile.data.name}...`)
              .setDescription(
                `Error! I am missing the following permissions: \`${missingPermission}\``
              )
              .setTimestamp();
          }

          interaction.reply({ embeds: [replyEmbed] });
          return;
        }
      }
    }
    interaction.reply({
      content: `:wrench: Command not found, try again.`,
      ephemeral: true,
    });
  },
  requiredPerms: requiredPerms,
};
