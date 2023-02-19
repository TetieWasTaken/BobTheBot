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
        const reason = i.fields.getTextInputValue("reason-input");

        const replyEmbed = new EmbedBuilder()
          .setColor(0x2f3136)
          .setAuthor({ name: `${interaction.user.tag}`, iconURL: `${interaction.member.displayAvatarURL()}` })
          .setFooter({ text: `#${interaction.channel.name}` })
          .setTimestamp(interaction.targetUser.createdAt);

        const confirmButton = new ButtonBuilder()
          .setCustomId("confirm-button")
          .setLabel("Confirm")
          .setStyle(ButtonStyle.Success);

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

        confirmCollector.on("collect", async (i) => {
          const guildData = await GuildSchema.findOne({
            GuildId: interaction.guild.id,
          });

          if (guildData && guildData.GuildLogChannel !== null) {
            const reportChannel = interaction.guild.channels.cache.get(guildData.GuildLogChannel);

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
              .setColor(0x57f287)
              .setAuthor({
                name: `${interaction.targetUser.tag} (${interaction.targetUser.id})`,
                iconURL: `${interaction.targetUser.displayAvatarURL()}`,
              })
              .setFooter({ text: `#${interaction.channel.name}` })
              .setTimestamp(interaction.targetUser.createdAt);

            return i.update({
              content: "User reported successfully!",
              embeds: [replyEmbed],
              components: [confirmedRow],
              ephemeral: true,
            });
          } else {
            i.reply({ content: `The report channel has not been set up.`, ephemeral: true });
          }
        });
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
