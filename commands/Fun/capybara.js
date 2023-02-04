const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const { roleColor } = require("../../utils/roleColor");

const requiredBotPerms = {
  type: "flags",
  key: [
    PermissionFlagsBits.ReadMessageHistory,
    PermissionFlagsBits.AddReactions,
  ],
};

const requiredUserPerms = {
  type: "flags",
  key: [],
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("capybara")
    .setDescription("Get a random capybara image"),
  async execute(interaction) {
    const img = await fetch("https://api.capy.lol/v1/capybara?json=true").then(
      (res) => res.json()
    );

    const embed = new EmbedBuilder()
      .setTitle("Okay I pull up")
      .setImage(`${img.data.url}`)
      .setColor(roleColor(interaction))
      .setFooter({
        text: `Requested by ${interaction.user.tag}`,
        iconURL: `${interaction.user.displayAvatarURL()}`,
      });

    await interaction.reply({ embeds: [embed] });
  },
  requiredBotPerms: requiredBotPerms,
  requiredUserPerms: requiredUserPerms,
};
