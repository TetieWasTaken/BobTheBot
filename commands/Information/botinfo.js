const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits } = require("discord.js");
const { EmbedBuilder } = require("discord.js");

const requiredPerms = {
  type: "flags",
  key: PermissionFlagsBits.SendMessages,
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("botinfo")
    .setDescription("Receive information about the bot"),
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

    const developerArray = ["Tetie#4242"];
    const replyEmbed = new EmbedBuilder()
      .addFields({
        name: `Name`,
        value: `
                    BobTheBot`,
        inline: true,
      })
      .addFields({
        name: `ID`,
        value: `
                    1036359071508484237`,
        inline: true,
      })
      .addFields({
        name: `Developers`,
        value: `
                    ${developerArray.join(", ") || "None"}`,
        inline: true,
      })
      .addFields({
        name: `Dependency versions`,
        value: `NodeJS: \`v18.12.0\`\nDiscord.JS: \`14.7.0\`\nMongoose: \`6.7.0\``,
        inline: true,
      })
      .addFields({
        name: `Links`,
        value:
          "[**Github**](https://github.com/UndefinedToast/BobTheBot)\n[**Discord**](https://discord.gg/FJ5DMEb8zA)",
        inline: true,
      })
      .setColor(roleColor)
      .setTimestamp();
    interaction.reply({
      embeds: [replyEmbed],
    });
  },
  requiredPerms: requiredPerms,
};
