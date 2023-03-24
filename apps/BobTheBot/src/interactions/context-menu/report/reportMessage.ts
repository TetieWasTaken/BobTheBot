import {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  EmbedBuilder,
  ApplicationCommandType,
  type MessageContextMenuCommandInteraction,
} from "discord.js";
import { Color } from "../../../constants.js";
import { GuildModel } from "../../../models/index.js";
import { permissionToString, logger, type ContextMenuCommand } from "../../../utils/index.js";

export const RequiredPerms = {
  bot: [],
  user: [],
} as const;

export const ReportMessageCommand: ContextMenuCommand = {
  name: "Report Message",
  type: ApplicationCommandType.Message,
  default_member_permissions: permissionToString(RequiredPerms.user),
  dm_permission: false,
} as const;

export async function execute(interaction: MessageContextMenuCommandInteraction<"cached">) {
  const modal = new ModalBuilder().setCustomId("report-message-modal").setTitle("Report Message");

  const messageInput = new TextInputBuilder()
    .setCustomId("message-input")
    .setLabel("Reason")
    .setMaxLength(1_024)
    .setMinLength(4)
    .setPlaceholder("Enter a detailed reason for reporting this message")
    .setRequired(true)
    .setStyle(TextInputStyle.Paragraph);

  const firstActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(messageInput);

  modal.addComponents(firstActionRow);

  await interaction.showModal(modal).catch((error: Error) => logger.error(error));

  await interaction
    .awaitModalSubmit({ filter: (modalI) => modalI.customId === "report-message-modal", time: 5 * 60 * 1_000 })
    .then(async (modalI) => {
      if (!interaction.channel) return;

      const message = modalI.fields.getTextInputValue("message-input");

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

      const reply = await modalI.reply({
        content: `Are you sure you want to report this message?`,
        embeds: [replyEmbed],
        components: [actionRow],
        ephemeral: true,
        fetchReply: true,
      });

      const confirmCollector = reply.createMessageComponentCollector({
        filter: (buttonI) => buttonI.customId === "confirm-button",
        time: 60 * 1_000,
      });

      confirmCollector
        .on("collect", async (buttonI) => {
          if (!interaction.channel) return;

          const guildData = await GuildModel.findOne({
            GuildId: interaction.guild.id,
          });

          if (guildData?.GuildLogChannel) {
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

            if (!reportChannel?.isTextBased()) {
              const replyEmbed = new EmbedBuilder()
                .setColor(Color.DiscordDanger)
                .setTitle(`Report failed`)
                .setDescription(`I was unable to find the log channel. Make sure I can view and send messages in it.`);
              return void buttonI.reply({ embeds: [replyEmbed], ephemeral: true });
            }

            try {
              await reportChannel.send({ embeds: [reportEmbed] });
            } catch {
              const replyEmbed = new EmbedBuilder()
                .setColor(Color.DiscordDanger)
                .setTitle(`Report failed`)
                .setDescription(
                  `I was unable to send the report to the report channel. Please check the permissions and try again.`
                );

              return void buttonI.reply({ embeds: [replyEmbed], ephemeral: true });
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

            return void buttonI.update({
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
            return void buttonI.update({ embeds: [replyEmbed], components: [confirmedRow] });
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
    .catch(async (error) => {
      if (error.message.endsWith("time")) {
        const replyEmbed = new EmbedBuilder()
          .setColor(Color.DiscordDanger)
          .setTitle(`Report user failed`)
          .setDescription(`You took too long to respond. Please try again.`);
        return interaction.followUp({ embeds: [replyEmbed], ephemeral: true });
      } else {
        logger.error(error);
        const replyEmbed = new EmbedBuilder()
          .setColor(Color.DiscordDanger)
          .setTitle(`Report user failed`)
          .setDescription(`An error occurred. Please try again.`);
        return interaction.followUp({ embeds: [replyEmbed], ephemeral: true });
      }
    });
}
