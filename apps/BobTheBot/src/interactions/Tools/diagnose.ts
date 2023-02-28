import { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, ChatInputCommandInteraction } from "discord.js";
import fs from "fs";

const requiredBotPerms = {
  type: "flags" as const,
  key: [] as const,
};

const requiredUserPerms = {
  type: "flags" as const,
  key: [] as const,
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("diagnose")
    .setDescription("Diagnose a command")
    .addStringOption((option) => option.setName("command").setDescription("The command to diagnose").setRequired(true)),
  async execute(interaction: ChatInputCommandInteraction<"cached">) {
    const command = interaction.options.getString("command");

    if (!interaction.guild.members.me)
      return interaction.reply({ content: ":x: I am not in this guild!", ephemeral: true });

    const commandFolders = fs.readdirSync("./interactions").filter((item) => !/(^|\/)\.[^/.]/g.test(item));
    for (const folder of commandFolders) {
      const commandFiles = fs.readdirSync(`./interactions/${folder}`).filter((file) => file.endsWith(".js"));
      for (const file of commandFiles) {
        const commandFile = require(`../../interactions/${folder}/${file}`);
        if (commandFile.data.name === command) {
          let requiredBotPerms = require(`../../interactions/${folder}/${file}`);
          requiredBotPerms = requiredBotPerms.requiredBotPerms;

          let replyEmbed = new EmbedBuilder();

          for (let i = 0; i < requiredBotPerms.key.length; i++) {
            if (!interaction.guild.members.me.permissions.has(requiredBotPerms.key[i])) {
              let missingPermission = new PermissionsBitField(requiredBotPerms.key[i]).toArray();

              replyEmbed = new EmbedBuilder()
                .setColor(0xed4245)
                .setTitle(`❌ Diagnosed command \`${commandFile.data.name}\``)
                .setDescription(`Error! I am missing the following permissions: \`${missingPermission}\``)
                .setFooter({
                  text: "Believe this is a mistake? Report it on our discord server!",
                });

              return interaction.reply({ embeds: [replyEmbed] });
            }
          }

          replyEmbed = new EmbedBuilder()
            .setColor(0x57f287)
            .setTitle(`✅ Diagnosed command \`${commandFile.data.name}\``)
            .setDescription(`No anomalies found`)
            .setFooter({
              text: "Believe this is a mistake? Report it on our discord server!",
            });

          return interaction.reply({ embeds: [replyEmbed] });
        }
      }
    }

    return interaction.reply({
      content: `:wrench: Command not found, try again.`,
      ephemeral: true,
    });
  },
  requiredBotPerms: requiredBotPerms,
  requiredUserPerms: requiredUserPerms,
};
