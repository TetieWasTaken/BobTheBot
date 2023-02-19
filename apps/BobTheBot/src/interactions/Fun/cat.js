const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");

const requiredBotPerms = {
  type: "flags",
  key: [],
};

const requiredUserPerms = {
  type: "flags",
  key: [],
};

module.exports = {
  data: new SlashCommandBuilder().setName("meow").setDescription("Get a random cat image!"),
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle("Meow!")
      .setImage(`https://cataas.com/cat?${Date.now()}`)
      .setColor(interaction.guild.members.me.displayHexColor)
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
