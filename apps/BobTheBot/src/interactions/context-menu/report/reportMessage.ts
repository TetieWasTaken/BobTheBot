import {
  ContextMenuCommandBuilder,
  ApplicationCommandType,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  EmbedBuilder,
  type MessageContextMenuCommandInteraction,
} from "discord.js";
import { GuildModel } from "../../../models/index.js";
import { logger } from "../../../utils/index.js";
import { Color } from "../../../constants.js";

module.exports = {
  data: new ContextMenuCommandBuilder()
    .setName("Report Message")
    .setType(ApplicationCommandType.Message)
    .setDMPermission(false),
  execute(interaction: MessageContextMenuCommandInteraction<"cached">) {
    const modal = new ModalBuilder().setCustomId("report-message-modal").setTitle("Report Message");

    const messageInput = new TextInputBuilder()
      .setCustomId("message-input")
      .setLabel("Reason")
      .setMaxLength(1024)
      .setMinLength(4)
      .setPlaceholder("Enter a detailed reason for reporting this message")
      .setRequired(true)
      .setStyle(TextInputStyle.Paragraph);

    const firstActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(messageInput);

    modal.addComponents(firstActionRow);

    interaction.showModal(modal);

    interaction
      .awaitModalSubmit({ filter: (i) => i.customId === "report-message-modal", time: 5 * 60 * 1000 })
      .then(async (i) => {
        if (!interaction.channel) return;

        const message = i.fields.getTextInputValue("message-input");

        const replyEmbed = new EmbedBuilder()
          .setColor(Color.DiscordEmbedBackground)
          .setAuthor({ name: `${interaction.user.tag}`, iconURL: `${interaction.member.displayAvatarURL()}` })
          .setDescription(
            `${interaction.targetMessage.content.length > 0 ? interaction.targetMessage.content : "No content"}`
          )
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

        const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(confirmButton, discordButton);
        const confirmedRow = new ActionRowBuilder<ButtonBuilder>().addComponents(discordButton);

        const reply = await i.reply({
          content: `Are you sure you want to report this message?`,
          embeds: [replyEmbed],
          components: [actionRow],
          ephemeral: true,
          fetchReply: true,
        });

        const confirmCollector = reply.createMessageComponentCollector({
          filter: (i) => i.customId === "confirm-button",
          time: 60 * 1000,
        });

        confirmCollector
          .on("collect", async (i) => {
            if (!interaction.channel) return;

            const guildData = await GuildModel.findOne({
              GuildId: interaction.guild.id,
            });

            if (guildData && guildData.GuildLogChannel) {
              const reportEmbed = new EmbedBuilder()
                .setColor(Color.DiscordDanger)
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

              const reportChannel = interaction.guild.channels.cache.get(guildData.GuildLogChannel);

              if (!reportChannel || !reportChannel.isTextBased()) {
                const replyEmbed = new EmbedBuilder()
                  .setColor(Color.DiscordDanger)
                  .setTitle(`Report failed`)
                  .setDescription(
                    `I was unable to find the log channel. Make sure I can view and send messages in it.`
                  );
                return void i.reply({ embeds: [replyEmbed], ephemeral: true });
              }

              try {
                reportChannel.send({ embeds: [reportEmbed] });
              } catch (err) {
                const replyEmbed = new EmbedBuilder()
                  .setColor(Color.DiscordDanger)
                  .setTitle(`Report failed`)
                  .setDescription(
                    `I was unable to send the report to the report channel. Please check the permissions and try again.`
                  );

                return void i.reply({ embeds: [replyEmbed], ephemeral: true });
              }

              const replyEmbed = new EmbedBuilder()
                .setColor(Color.DiscordSuccess)
                .setAuthor({
                  name: `${interaction.targetMessage.author.tag} (${interaction.targetMessage.author.id})`,
                  iconURL: `${interaction.targetMessage.author.displayAvatarURL()}`,
                })
                .setDescription(
                  `${interaction.targetMessage.content.length > 0 ? interaction.targetMessage.content : "No content"}`
                )
                .setFooter({ text: `#${interaction.channel.name}` })
                .setTimestamp(interaction.targetMessage.createdAt);

              return void i.update({
                content: "Message reported successfully!",
                embeds: [replyEmbed],
                components: [confirmedRow],
              });
            } else {
              const replyEmbed = new EmbedBuilder()
                .setColor(Color.DiscordDanger)
                .setTitle(`Report message failed`)
                .setDescription(
                  `The server moderators have not set up a log channel. Please contact them to set one up.`
                );
              return void i.update({ embeds: [replyEmbed], components: [confirmedRow] });
            }
          })
          .on("end", () => {
            const replyEmbed = new EmbedBuilder()
              .setColor(Color.DiscordDanger)
              .setTitle(`Report message failed`)
              .setDescription(`You took too long to respond. Please try again.`);
            return void interaction.followUp({ embeds: [replyEmbed] });
          });
      })
      .catch((err) => {
        if (err.message.endsWith("time")) {
          const replyEmbed = new EmbedBuilder()
            .setColor(Color.DiscordDanger)
            .setTitle(`Report user failed`)
            .setDescription(`You took too long to respond. Please try again.`);
          return interaction.followUp({ embeds: [replyEmbed], ephemeral: true });
        } else {
          logger.error(err);
          const replyEmbed = new EmbedBuilder()
            .setColor(Color.DiscordDanger)
            .setTitle(`Report user failed`)
            .setDescription(`An error occurred. Please try again.`);
          return interaction.followUp({ embeds: [replyEmbed], ephemeral: true });
        }
      });
  },
};
