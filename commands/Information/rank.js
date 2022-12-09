const { SlashCommandBuilder } = require("@discordjs/builders");
const LevelSchema = require("../../models/LevelModel");
const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const { roleColor } = require("../../functions/roleColor.js");

const requiredPerms = {
  type: "flags",
  key: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks],
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("rank")
    .setDescription("Returns xp and rank of given user in the server")
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("User to display rank of")
        .setRequired(false)
    ),
  async execute(interaction) {
    let user = interaction.options.getUser("target") ?? interaction.user;

    if (user.bot) {
      return interaction.reply({
        content: "Bots don't have ranks!",
        ephemeral: true,
      });
    }

    let data = await LevelSchema.findOne({
      GuildId: interaction.guild.id,
      UserId: user.id,
    });

    let userXP = 0;
    let userLevel = 0;

    if (data) {
      userXP = data.UserXP;
      userLevel = data.UserLevel;
    }

    let userNickname = ` (${user.nickname ?? ""})`;
    if (userNickname == " ()") {
      userNickname = "";
    }

    let xpNeeded = 50 * (userLevel + 1) ** 2 + 50;

    const rankEmbed = new EmbedBuilder()
      .setColor(roleColor(interaction))
      .setAuthor({
        name: `${user.username}#${user.discriminator}` + userNickname,
        iconURL: `${user.displayAvatarURL()}`,
      })
      .addFields(
        {
          name: `XP`,
          value: `\`${userXP}\`/\`${xpNeeded}\``,
          inline: true,
        },
        { name: `RANK`, value: `\`${userLevel}\``, inline: true }
      )
      .setTimestamp();

    interaction.reply({
      embeds: [rankEmbed],
    });
  },
  requiredPerms: requiredPerms,
};
