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
    .setName("jail")
    .setDescription("Jail someone's avatar")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("color")
        .setDescription("Generate a jail image")

        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("The user to trigger")
            .setRequired(false)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("grayscale")
        .setDescription("Generate a light youtube comment")
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("The user to trigger")
            .setRequired(false)
        )
    ),
  async execute(interaction) {
    const user = interaction.options.getUser("user") ?? interaction.user;
    const grayscale =
      interaction.options.getSubcommand() === "grayscale" ? true : false;

    let jail = await canvacord.Canvas.jail(
      user.displayAvatarURL({ format: "png", dynamic: true }),
      grayscale
    );

    if (jail instanceof canvacord.Canvas) {
      let jail = await jail.toBuffer();
    }

    interaction.reply({
      files: [jail],
    });
  },
  requiredBotPerms: requiredBotPerms,
  requiredUserPerms: requiredUserPerms,
};
