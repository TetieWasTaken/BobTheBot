const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const { roleColor } = require("../../utils/roleColor");

const requiredPerms = {
  type: "flags",
  key: [
    PermissionFlagsBits.SendMessages,
    PermissionFlagsBits.EmbedLinks,
    PermissionFlagsBits.AttachFiles,
    PermissionFlagsBits.ReadMessageHistory,
    PermissionFlagsBits.AddReactions,
  ],
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("meow")
    .setDescription("Get a random cat image!"),
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle("Meow!")
      .setImage(`https://cataas.com/cat?${Date.now()}`)
      .setColor(roleColor(interaction))
      .setTimestamp()
      .setFooter({
        text: `Requested by ${interaction.user.tag}`,
        iconURL: `${interaction.user.displayAvatarURL()}`,
      });

    await interaction.reply({ embeds: [embed] });
  },
  requiredPerms: requiredPerms,
};
