const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits } = require("discord.js");

const requiredPerms = {
  type: "flags",
  key: [PermissionFlagsBits.SendMessages],
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("eval")
    .setDescription("Evaluates a given code")
    .addStringOption((option) =>
      option
        .setName("code")
        .setDescription("The code to evaluate")
        .setRequired(true)
    ),
  async execute(interaction) {
    const code = interaction.options.getString("code");
    try {
      const ev = eval(code);
      await interaction.reply({
        content: `:white_check_mark: Evaluated successfully!\n\`\`\`js\n${ev}\`\`\``,
        ephemeral: true,
      });
    } catch (err) {
      await interaction.reply({
        content: `:x: An error occured while evaluating the code!\n\`\`\`js\n${err}\`\`\``,
        ephemeral: true,
      });
    }
  },
  requiredPerms: requiredPerms,
};
