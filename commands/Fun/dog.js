const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");

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
    .setName("woof")
    .setDescription("Get a random dog image!"),
  async execute(interaction) {
    const res = await fetch("https:random.dog/woof.json").then((res) =>
      res.json()
    );
    const embed = new EmbedBuilder()
      .setTitle("Woof!")
      .setImage(res.url)
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
