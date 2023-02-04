//const canvacord = require("canvacord");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits } = require("discord.js");

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
    .setName("trigger")
    .setDescription("Trigger someone's avatar")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to trigger")
        .setRequired(false)
    ),
  async execute(interaction) {
    const user = interaction.options.getUser("user") ?? interaction.user;

    let faceplam = await canvacord.Canvas.trigger(
      user.displayAvatarURL({ format: "png", dynamic: true })
    );

    if (faceplam instanceof canvacord.Canvas) {
      let faceplam = await faceplam.toBuffer();
    }

    interaction.reply({
      files: [faceplam],
    });
  },
  requiredBotPerms: requiredBotPerms,
  requiredUserPerms: requiredUserPerms,
};
