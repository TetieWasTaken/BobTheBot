const InfractionsSchema = require("../../models/InfractionsModel");
const { PermissionFlagsBits } = require("discord.js");
const { EmbedBuilder } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Warns a user in the current guild")
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("member to warn")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("reason for warn")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .setDMPermission(false),
  async execute(interaction) {
    const user = interaction.options.getUser("target");
    const reason = interaction.options.getString("reason");

    let data = await InfractionsSchema.findOne({
      GuildId: interaction.guild.id,
      UserId: user.id,
    });

    if (data) {
      data.Punishments.unshift({
        PunishType: "WARN",
        Reason: reason,
      });
      data.save();
    } else if (!data) {
      let newData = new InfractionsSchema({
        GuildId: interaction.guild.id,
        UserId: user.id,
        Punishments: [
          {
            PunishType: "WARN",
            Reason: reason,
          },
        ],
      });
      newData.save();
    }

    user
      .send(`You have been warned in ${interaction.guild.name} for ${reason}`)
      .catch(console.log);

    interaction.reply({
      content: `:warning:  \`${user.username}#${user.discriminator}\` has been warned for \`${reason}\``,
      ephemeral: true,
    });
  },
};
