const { SlashCommandBuilder } = require("@discordjs/builders");
const GuildSchema = require("../../models/GuildModel");
const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
} = require("discord.js");

const requiredPerms = {
  type: "flags",
  key: PermissionFlagsBits.SendMessages,
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setup")
    .setDescription("Set up the bot for your server"),
  async execute(interaction) {
    if (
      !interaction.member.permissions.has(PermissionFlagsBits.Administrator)
    ) {
      return interaction.reply({
        content: "You do not have the `ADMINISTRATOR` permission!",
        ephemeral: true,
      });
    }

    let data = await GuildSchema.findOne({
      GuildId: interaction.guild.id,
    });

    let GuildLogChannelResponse;

    if (data) {
      GuildLogChannelResponse = `<#${data.GuildLogChannel}>`;
    }

    if (!data) {
      GuildLogChannelResponse = "Not set";
      data = new GuildSchema({
        GuildId: interaction.guild.id,
        GuildLogChannel: "Not set",
      });
      data.save();
    }

    let roleColor = "ffffff";
    const member = interaction.guild.members.cache.get(
      interaction.client.user.id
    );
    const roleCacheSize = member.roles.cache.size;
    if (roleCacheSize >= 2) {
      if (member.roles.color !== null) {
        roleColor = member.roles.color.hexColor;
      }
    }

    const replyEmbed = new EmbedBuilder()
      .setColor(roleColor)
      .setTitle(`Current server data`)
      .addFields(
        {
          name: `Guild ID`,
          value: `${data.GuildId}`,
          inline: true,
        },
        {
          name: `Guild log channel`,
          value: `${GuildLogChannelResponse}`,
          inline: true,
        }
      )
      .setTimestamp();

    const button = new ButtonBuilder()
      .setCustomId("full-setup")
      .setLabel("Full Setup")
      .setStyle(ButtonStyle.Primary);

    interaction.reply({
      embeds: [replyEmbed],
      components: [new ActionRowBuilder().addComponents(button)],
    });
  },
  requiredPerms: requiredPerms,
};
