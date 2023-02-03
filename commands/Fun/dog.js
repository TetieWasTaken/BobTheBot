const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const { roleColor } = require("../../utils/roleColor");

const requiredPerms = {
  type: "flags",
  key: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks],
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("woof")
    .setDescription("Get a random dog image!"),
  async execute(interaction) {
    const res = await fetch("https:random.dog/woof.json").then((res) =>
      res.json()
    );
    const embed = new EmbedBuilder()
      .setTitle("Woof!")
      .setImage(res.url)
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
