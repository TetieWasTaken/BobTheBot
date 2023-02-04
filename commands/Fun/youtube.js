//const canvacord = require("canvacord");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits } = require("discord.js");

const requiredBotPerms = {
  type: "flags",
  key: [],
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("youtube")
    .setDescription("Generate a youtube comment")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("dark")
        .setDescription("Generate a dark youtube comment")
        .addStringOption((option) =>
          option
            .setName("comment")
            .setDescription("The comment to generate")
            .setRequired(true)
        )
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("The user to trigger")
            .setRequired(false)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("light")
        .setDescription("Generate a light youtube comment")
        .addStringOption((option) =>
          option
            .setName("comment")
            .setDescription("The comment to generate")
            .setRequired(true)
        )
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("The user to trigger")
            .setRequired(false)
        )
    ),
  async execute(interaction) {
    const comment = interaction.options.getString("comment");
    const user = interaction.options.getUser("user") ?? interaction.user;
    const dark = interaction.options.getSubcommand() === "dark" ? true : false;

    let youtube = await canvacord.Canvas.youtube({
      username: user.username,
      content: comment,
      avatar: user.displayAvatarURL({ format: "png", dynamic: true }),
      dark: dark,
    });

    if (youtube instanceof canvacord.Canvas) {
      let youtube = await youtube.toBuffer();
    }

    interaction.reply({
      files: [youtube],
    });
  },
  requiredBotPerms: requiredBotPerms,
};
