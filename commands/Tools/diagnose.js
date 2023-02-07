const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionsBitField,
  PermissionFlagsBits,
} = require("discord.js");
const fs = require("fs");

const requiredBotPerms = {
  type: "flags",
  key: [],
};

const requiredUserPerms = {
  type: "flags",
  key: [],
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
          let requiredBotPerms = require(`../../commands/${folder}/${file}`);
          requiredBotPerms = requiredBotPerms.requiredBotPerms;

          let replyEmbed = new EmbedBuilder();

          for (i = 0; i < requiredBotPerms.key.length; i++) {
            if (
              !interaction.guild.members.me.permissions.has(
                requiredBotPerms.key[i]
              )
            ) {
              let missingPermission = new PermissionsBitField(
                requiredBotPerms.key[i]
              ).toArray();

              replyEmbed = new EmbedBuilder()
                .setColor(0xff0000)
                .setTitle(`❌ Diagnosed command \`${commandFile.data.name}\``)
                .setDescription(
                  `Error! I am missing the following permissions: \`${missingPermission}\``
                )
                .setFooter({
                  text: "Believe this is a mistake? Report it on our discord server!",
                });

              return interaction.reply({ embeds: [replyEmbed] });
            }
          }

          replyEmbed = new EmbedBuilder()
            .setColor(0x00ff00)
            .setTitle(`✅ Diagnosed command \`${commandFile.data.name}\``)
            .setDescription(`No anomalies found`)
            .setFooter({
              text: "Believe this is a mistake? Report it on our discord server!",
            });

          return interaction.reply({ embeds: [replyEmbed] });
        }
      }
    }
    interaction.reply({
      content: `:wrench: Command not found, try again.`,
      ephemeral: true,
    });
  },
  requiredBotPerms: requiredBotPerms,
  requiredUserPerms: requiredUserPerms,
};
