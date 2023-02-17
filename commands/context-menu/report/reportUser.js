const {
  ContextMenuCommandBuilder,
  ApplicationCommandType,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  EmbedBuilder,
} = require("discord.js");
const GuildSchema = require("../../../models/GuildModel");

module.exports = {
  data: new ContextMenuCommandBuilder().setName("Report User").setType(ApplicationCommandType.User),
  execute(interaction) {
    const modal = new ModalBuilder().setCustomId("report-user-modal").setTitle("Report User");

    const userInput = new TextInputBuilder()
      .setCustomId("reason-input")
      .setLabel("Reason")
      .setMaxLength(1024)
      .setMinLength(4)
      .setPlaceholder("Enter a detailed reason for reporting this user")
      .setRequired(true)
      .setStyle(TextInputStyle.Paragraph);

    const firstActionRow = new ActionRowBuilder().addComponents(userInput);

    modal.addComponents(firstActionRow);

    interaction.showModal(modal);

    interaction
      .awaitModalSubmit({ filter: (i) => i.customId === "report-user-modal", time: 5 * 60 * 1000 })
      .then(async (i) => {
        const guildData = await GuildSchema.findOne({
          GuildId: interaction.guild.id,
        });

        if (guildData && guildData.GuildLogChannel !== null) {
          const reportChannel = interaction.guild.channels.cache.get(guildData.GuildLogChannel);

          const reason = i.fields.getTextInputValue("reason-input");

          const reportEmbed = new EmbedBuilder()
            .setColor(0xff0000)
            .setAuthor({ name: `${interaction.user.tag}`, iconURL: `${interaction.member.displayAvatarURL()}` })
            .setTitle(`User reported | ${interaction.channel.name}`)
            .setURL(`https://discord.com/users/${interaction.targetUser.id}`)
            .addFields(
              {
                name: `Target`,
                value: `\`\`\`ini\nUser = ${interaction.targetUser.tag}\nId = ${interaction.targetUser.id}\`\`\``,
                inline: true,
              },
              {
                name: `Reason`,
                value: `\`\`\`\n${reason}\`\`\``,
                inline: false,
              }
            );

          try {
            reportChannel.send({ embeds: [reportEmbed] });
          } catch (err) {
            const replyEmbed = new EmbedBuilder()
              .setColor(0xff0000)
              .setTitle(`Report failed`)
              .setDescription(
                `I was unable to send the report to the report channel. Please check the permissions and try again.`
              );

            return i.reply({ embeds: [replyEmbed], ephemeral: true });
          }

          const replyEmbed = new EmbedBuilder()
            .setColor(0xffffff)
            .setTitle(`User reported`)
            .setURL(`https://discord.com/users/${interaction.targetUser.id}`)
            .addFields(
              {
                name: `Target`,
                value: `\`\`\`ini\nUser = ${interaction.targetUser.tag}\nId = ${interaction.targetUser.id}\`\`\``,
                inline: true,
              },
              {
                name: `Reason`,
                value: `\`\`\`\n${reason}\`\`\``,
                inline: false,
              }
            );

          i.reply({ embeds: [replyEmbed], ephemeral: true });
        } else {
          i.reply({ content: `The report channel has not been set up.`, ephemeral: true });
        }
      })
      .catch((err) => {
        if (err.message.endsWith("time")) {
          const replyEmbed = new EmbedBuilder()
            .setColor(0xff0000)
            .setTitle(`Report user failed`)
            .setDescription(`You took too long to respond. Please try again.`);
          interaction.followUp({ embeds: [replyEmbed], ephemeral: true });
        } else {
          console.log(err);
          const replyEmbed = new EmbedBuilder()
            .setColor(0xff0000)
            .setTitle(`Report user failed`)
            .setDescription(`An error occurred. Please try again.`);
          interaction.followUp({ embeds: [replyEmbed], ephemeral: true });
        }
      });
  },
};
