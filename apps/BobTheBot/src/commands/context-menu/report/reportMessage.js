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
  data: new ContextMenuCommandBuilder().setName("Report Message").setType(ApplicationCommandType.Message),
  execute(interaction) {
    const modal = new ModalBuilder().setCustomId("report-message-modal").setTitle("Report Message");

    const messageInput = new TextInputBuilder()
      .setCustomId("message-input")
      .setLabel("Reason")
      .setMaxLength(1024)
      .setMinLength(4)
      .setPlaceholder("Enter a detailed reason for reporting this message")
      .setRequired(true)
      .setStyle(TextInputStyle.Paragraph);

    const firstActionRow = new ActionRowBuilder().addComponents(messageInput);

    modal.addComponents(firstActionRow);

    interaction.showModal(modal);

    interaction
      .awaitModalSubmit({ filter: (i) => i.customId === "report-message-modal", time: 5 * 60 * 1000 })
      .then(async (i) => {
        const guildData = await GuildSchema.findOne({
          GuildId: interaction.guild.id,
        });

        if (guildData && guildData.GuildLogChannel !== null) {
          const reportChannel = interaction.guild.channels.cache.get(guildData.GuildLogChannel);

          const message = i.fields.getTextInputValue("message-input");

          const reportEmbed = new EmbedBuilder()
            .setColor(0xff0000)
            .setAuthor({ name: `${interaction.user.tag}`, iconURL: `${interaction.member.displayAvatarURL()}` })
            .setTitle(`Message reported | ${interaction.channel.name}`)
            .setURL(`${interaction.targetMessage.url}`)
            .addFields(
              {
                name: `Message`,
                value: `\`\`\`\n${interaction.targetMessage.content}\`\`\``,
                inline: false,
              },
              {
                name: `Target`,
                value: `\`\`\`ini\nUser = ${interaction.targetMessage.author.tag}\nId = ${interaction.targetMessage.author.id}\`\`\``,
                inline: true,
              },
              {
                name: `Reason`,
                value: `\`\`\`\n${message}\`\`\``,
                inline: false,
              }
            );

          reportChannel.send({ embeds: [reportEmbed] });

          const replyEmbed = new EmbedBuilder()
            .setColor(0xffffff)
            .setTitle(`Message reported`)
            .setURL(`${interaction.targetMessage.url}`)
            .addFields(
              {
                name: `Message`,
                value: `\`\`\`\n${interaction.targetMessage.content}\`\`\``,
                inline: false,
              },
              {
                name: `Reason`,
                value: `\`\`\`\n${message}\`\`\``,
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
            .setTitle(`Report message failed`)
            .setDescription(`You took too long to respond. Please try again.`);
          interaction.followUp({ embeds: [replyEmbed], ephemeral: true });
        } else {
          console.log(err);
          const replyEmbed = new EmbedBuilder()
            .setColor(0xff0000)
            .setTitle(`Report message failed`)
            .setDescription(`An error occurred. Please try again.`);
          interaction.followUp({ embeds: [replyEmbed], ephemeral: true });
        }
      });
  },
};
