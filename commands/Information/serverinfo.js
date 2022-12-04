const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");

const requiredPerms = {
  type: "flags",
  key: PermissionFlagsBits.SendMessages,
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("serverinfo")
    .setDescription("Receive information about the current guild"),
  async execute(interaction) {
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

    var serverIcon = interaction.guild.iconURL();
    var boostCount = interaction.guild.premiumSubscriptionCount;
    var boostTier = 0;

    if (boostCount >= 2) {
      boostTier = 1;
    } else if (boostCount >= 7) {
      boostTier = 2;
    } else if (boostCount >= 14) {
      boostTier = 3;
    }

    const fetchedOwner = await Promise.resolve(interaction.guild.fetchOwner());

    const replyEmbed = new EmbedBuilder()
      .setColor(roleColor)
      .setAuthor({ name: `${interaction.guild.name}`, iconURL: serverIcon })
      .setThumbnail(serverIcon)
      .addFields(
        {
          name: "General information",
          value: `
          *Owner:* \`${fetchedOwner.user.tag}\`
                *Member count:* \`${interaction.guild.memberCount}\`
                *Boosts:* \`${boostCount}\``,
          inline: true,
        },
        {
          name: "Other",
          value: `
          *Roles:* \`${interaction.guild.roles.cache.size - 1}\`
                *Boost tier:* \`${boostTier}\`
                *Channels:* \`${
                  interaction.guild.channels.channelCountWithoutThreads
                }\``,
          inline: true,
        }
      )
      .setFooter({ text: `${interaction.guild.id}` })
      .setTimestamp();

    interaction.reply({
      embeds: [replyEmbed],
    });
  },
  requiredPerms: requiredPerms,
};
