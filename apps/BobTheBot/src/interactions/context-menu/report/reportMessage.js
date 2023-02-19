const {
  ContextMenuCommandBuilder,
  ApplicationCommandType,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ButtonBuilder,
  ButtonStyle,
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
        const message = i.fields.getTextInputValue("message-input");

        const replyEmbed = new EmbedBuilder()
          .setColor(0x2f3136)
          .setAuthor({ name: `${interaction.user.tag}`, iconURL: `${interaction.member.displayAvatarURL()}` })
          .setDescription(`${interaction.targetMessage.content}`)
          .setFooter({ text: `#${interaction.channel.name}` })
          .setTimestamp(interaction.targetMessage.createdAt);

        const confirmButton = new ButtonBuilder()
          .setCustomId("confirm-button")
          .setLabel("Confirm")
          .setStyle(ButtonStyle.Danger);

        const discordButton = new ButtonBuilder()
          .setLabel("Report to Discord")
          .setStyle(ButtonStyle.Link)
          .setURL("https://dis.gd/report");

        const actionRow = new ActionRowBuilder().addComponents(confirmButton, discordButton);
        const confirmedRow = new ActionRowBuilder().addComponents(discordButton);

        const reply = await i.reply({
          content: `Are you sure you want to report this message?`,
          embeds: [replyEmbed],
          components: [actionRow],
          ephemeral: true,
          fetchReply: true,
        });

        const confirmCollector = await reply.createMessageComponentCollector({
          filter: (i) => i.customId === "confirm-button",
          time: 60 * 1000,
        });

        confirmCollector
          .on("collect", async (i) => {
            const guildData = await GuildSchema.findOne({
              GuildId: interaction.guild.id,
            });

            if (guildData && guildData.GuildLogChannel !== null) {
              const reportChannel = interaction.guild.channels.cache.get(guildData.GuildLogChannel);

              const reportEmbed = new EmbedBuilder()
                .setColor(0xed4245)
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

              try {
                reportChannel.send({ embeds: [reportEmbed] });
              } catch (err) {
                const replyEmbed = new EmbedBuilder()
                  .setColor(0xed4245)
                  .setTitle(`Report failed`)
                  .setDescription(
                    `I was unable to send the report to the report channel. Please check the permissions and try again.`
                  );

                return i.reply({ embeds: [replyEmbed], ephemeral: true });
              }

              const replyEmbed = new EmbedBuilder()
                .setColor(0x57f287)
                .setAuthor({
                  name: `${interaction.targetMessage.author.tag} (${interaction.targetMessage.author.id})`,
                  iconURL: `${interaction.targetMessage.user.displayAvatarURL()}`,
                })
                .setDescription(`${interaction.targetMessage.content}`)
                .setFooter({ text: `#${interaction.channel.name}` })
                .setTimestamp(interaction.targetMessage.createdAt);

              return i.update({
                content: "Message reported successfully!",
                embeds: [replyEmbed],
                components: [confirmedRow],
                ephemeral: true,
              });
            } else {
              const replyEmbed = new EmbedBuilder()
                .setColor(0x992d22)
                .setTitle(`Report message failed`)
                .setDescription(
                  `The server moderators have not set up a log channel. Please contact them to set one up.`
                );
              return i.update({ embeds: [replyEmbed], components: [confirmedRow], ephemeral: true });
            }
          })
          .on("end", () => {
            const replyEmbed = new EmbedBuilder()
              .setColor(0xed4245)
              .setTitle(`Report message failed`)
              .setDescription(`You took too long to respond. Please try again.`);
            return interaction.followUp({ embeds: [replyEmbed], ephemeral: true });
          });
      })
      .catch((err) => {
        if (err.message.endsWith("time")) {
          const replyEmbed = new EmbedBuilder()
            .setColor(0xed4245)
            .setTitle(`Report user failed`)
            .setDescription(`You took too long to respond. Please try again.`);
          interaction.followUp({ embeds: [replyEmbed], ephemeral: true });
        } else {
          console.log(err);
          const replyEmbed = new EmbedBuilder()
            .setColor(0xed4245)
            .setTitle(`Report user failed`)
            .setDescription(`An error occurred. Please try again.`);
          interaction.followUp({ embeds: [replyEmbed], ephemeral: true });
        }
      });
  },
};
