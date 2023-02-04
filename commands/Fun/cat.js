const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
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
  requiredBotPerms: requiredBotPerms,
  requiredUserPerms: requiredUserPerms,
};
