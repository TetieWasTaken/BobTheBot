import {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  EmbedBuilder,
  ApplicationCommandType,
  type UserContextMenuCommandInteraction,
} from "discord.js";
import { Color } from "../../../constants.js";
import { GuildModel } from "../../../models/index.js";
import { permissionToString, logger, type ContextMenuCommand } from "../../../utils/index.js";

export const RequiredPerms = {
  bot: [],
  user: [],
} as const;

export const ReportUserCommand: ContextMenuCommand = {
  name: "Report User",
  type: ApplicationCommandType.User,
  default_member_permissions: permissionToString(RequiredPerms.user),
  dm_permission: false,
} as const;

export async function execute(interaction: UserContextMenuCommandInteraction<"cached">) {
  if (!interaction.channel) return;

  const modal = new ModalBuilder().setCustomId("report-user-modal").setTitle("Report User");

  const userInput = new TextInputBuilder()
    .setCustomId("reason-input")
    .setLabel("Reason")
    .setMaxLength(1_024)
    .setMinLength(4)
    .setPlaceholder("Enter a detailed reason for reporting this user")
    .setRequired(true)
    .setStyle(TextInputStyle.Paragraph);

  const firstActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(userInput);

  modal.addComponents(firstActionRow);

  await interaction.showModal(modal).catch((error: Error) => logger.error(error));

  await interaction
    .awaitModalSubmit({ filter: (modalI) => modalI.customId === "report-user-modal", time: 5 * 60 * 1_000 })
    .then(async (modalI) => {
      if (!interaction.channel) return;

      const reason = modalI.fields.getTextInputValue("reason-input");

      const replyEmbed = new EmbedBuilder()
        .setColor(Color.DiscordEmbedBackground)
        .setAuthor({ name: `${interaction.user.tag}`, iconURL: `${interaction.member.displayAvatarURL()}` })
        .setFooter({ text: `#${interaction.channel.name}` })
        .setTimestamp(interaction.targetUser.createdAt);

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
        content: `Are you sure you want to report this user?`,
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
            const reportChannel = interaction.guild.channels.cache.get(guildData.GuildLogChannel);

            const reportEmbed = new EmbedBuilder()
              .setColor(Color.DiscordDanger)
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
                name: `${interaction.targetUser.tag} (${interaction.targetUser.id})`,
                iconURL: `${interaction.targetUser.displayAvatarURL()}`,
              })
              .setFooter({ text: `#${interaction.channel.name}` })
              .setTimestamp(interaction.targetUser.createdAt);

            return void buttonI.update({
              content: "User reported successfully!",
              embeds: [replyEmbed],
              components: [confirmedRow],
            });
          } else {
            return void buttonI.reply({ content: `The report channel has not been set up.`, ephemeral: true });
          }
        })
        .on("end", () => {
          const replyEmbed = new EmbedBuilder()
            .setColor(Color.DiscordDanger)
            .setTitle(`Report user failed`)
            .setDescription(`You took too long to respond. Please try again.`);
          return void interaction.followUp({ embeds: [replyEmbed] });
        });
    })
    .catch((error) => {
      if (error.message.endsWith("time")) {
        const replyEmbed = new EmbedBuilder()
          .setColor(Color.DiscordDanger)
          .setTitle(`Report user failed`)
          .setDescription(`You took too long to respond. Please try again.`);
        interaction.followUp({ embeds: [replyEmbed], ephemeral: true }).catch((error) => logger.error(error));
      } else {
        logger.error(error);
        const replyEmbed = new EmbedBuilder()
          .setColor(Color.DiscordDanger)
          .setTitle(`Report user failed`)
          .setDescription(`An error occurred. Please try again.`);
        interaction.followUp({ embeds: [replyEmbed], ephemeral: true }).catch((error) => logger.error(error));
      }
    });
}
