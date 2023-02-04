const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const { roleColor } = require("../../utils/roleColor.js");

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
    .setName("serverinfo")
    .setDescription("Receive information about the current guild"),
  async execute(interaction) {
    let serverIcon = interaction.guild.iconURL();
    let boostCount = interaction.guild.premiumSubscriptionCount;
    let boostTier = 0;

    if (boostCount >= 2) {
      boostTier = 1;
    } else if (boostCount >= 7) {
      boostTier = 2;
    } else if (boostCount >= 14) {
      boostTier = 3;
    }

    const fetchedOwner = await Promise.resolve(interaction.guild.fetchOwner());

    const replyEmbed = new EmbedBuilder()
      .setColor(roleColor(interaction))
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
  requiredBotPerms: requiredBotPerms,
  requiredUserPerms: requiredUserPerms,
};
