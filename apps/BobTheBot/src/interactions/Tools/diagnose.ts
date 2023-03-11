import fs from "node:fs";
import { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, type ChatInputCommandInteraction } from "discord.js";
import { Color } from "../../constants.js";

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
    .addStringOption((option) => option.setName("command").setDescription("The command to diagnose").setRequired(true))
    .setDMPermission(false),
  async execute(interaction: ChatInputCommandInteraction<"cached">) {
    const command = interaction.options.getString("command");

    if (!interaction.guild.members.me)
      return interaction.reply({ content: ":x: I am not in this guild!", ephemeral: true });

    const commandFolders = fs.readdirSync("./interactions").filter((item) => !/(?:^|\/)\.[^./]/g.test(item));
    for (const folder of commandFolders) {
      const commandFiles = fs.readdirSync(`./interactions/${folder}`).filter((file) => file.endsWith(".js"));
      for (const file of commandFiles) {
        /* eslint-disable @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports */
        const commandFile = require(`../../interactions/${folder}/${file}`);
        if (commandFile.data.name === command) {
          let requiredBotPerms = require(`../../interactions/${folder}/${file}`);
          /* eslint-enable @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports */
          requiredBotPerms = requiredBotPerms.requiredBotPerms;

          let replyEmbed = new EmbedBuilder();

          for (const perm of requiredBotPerms.key) {
            if (!interaction.guild.members.me.permissions.has(perm)) {
              const missingPermission = new PermissionsBitField(perm).toArray();

              replyEmbed = new EmbedBuilder()
                .setColor(Color.DiscordDanger)
                .setTitle(`❌ Diagnosed command \`${commandFile.data.name}\``)
                .setDescription(`Error! I am missing the following permissions: \`${missingPermission}\``)
                .setFooter({
                  text: "Believe this is a mistake? Report it on our discord server!",
                });

              return interaction.reply({ embeds: [replyEmbed] });
            }
          }

          replyEmbed = new EmbedBuilder()
            .setColor(Color.DiscordSuccess)
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
  requiredBotPerms,
  requiredUserPerms,
};
