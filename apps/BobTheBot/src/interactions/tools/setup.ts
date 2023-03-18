import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  type ButtonInteraction,
  type ChatInputCommandInteraction,
  type ModalSubmitInteraction,
} from "discord.js";
import { Color } from "../../constants.js";
import { GuildModel } from "../../models/index.js";
import { permissionToString, logger, type ChatInputCommand } from "../../utils/index.js";

export const RequiredPerms = {
  bot: [],
  user: [PermissionFlagsBits.Administrator],
} as const;

export const SetupCommand: ChatInputCommand = {
  name: "setup",
  description: "Set up the bot for your server",
  default_member_permissions: permissionToString(RequiredPerms.user),
  dm_permission: false,
} as const;

export async function execute(interaction: ChatInputCommandInteraction<"cached">) {
  let data = await GuildModel.findOne({
    GuildId: interaction.guild.id,
  });

  let GuildLogChannelResponse;

  if (data) {
    GuildLogChannelResponse = `<#${data.GuildLogChannel}>`;
  }

  if (!data) {
    GuildLogChannelResponse = "Not set";
    data = new GuildModel({
      GuildId: interaction.guild.id,
      GuildLogChannel: "Not set",
    });

    await data.save().catch((error: Error) => logger.error(error));
  }

  const replyEmbed = new EmbedBuilder()
    .setColor(interaction.guild.members.me?.displayHexColor ?? Color.DiscordPrimary)
    .setTitle(`Current server data`)
    .addFields(
      {
        name: `Guild ID`,
        value: `${data.GuildId}`,
        inline: true,
      },
      {
        name: `Guild log channel`,
        value: `${GuildLogChannelResponse}`,
        inline: true,
      }
    )
    .setTimestamp();

  const button = new ButtonBuilder().setCustomId("full-setup").setLabel("Full Setup").setStyle(ButtonStyle.Primary);

  const reply = await interaction.reply({
    embeds: [replyEmbed],
    components: [new ActionRowBuilder<ButtonBuilder>().addComponents(button)],
    ephemeral: true,
    fetchReply: true,
  });

  const buttonCollector = reply.createMessageComponentCollector({
    filter: (buttonI) => buttonI.customId === "full-setup",
    time: 60 * 1_000,
  });

  buttonCollector
    .on("collect", async (buttonI: ButtonInteraction) => {
      const modal = new ModalBuilder().setCustomId("full-setup-modal").setTitle("Full Setup");

      const logChannelIdInput = new TextInputBuilder()
        .setMaxLength(19)
        .setMinLength(16)
        .setPlaceholder("1036359877473341563")
        .setRequired(true)
        .setCustomId("logChannelIdInput")
        .setLabel("Enter the channel ID the bot should log to")
        .setStyle(TextInputStyle.Short);

      const firstActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(logChannelIdInput);

      modal.addComponents(firstActionRow);

      await buttonI.showModal(modal).catch(async () => {
        return buttonI.reply({
          content: `Something went wrong!`,
        });
      });

      await buttonI
        .awaitModalSubmit({ filter: (modalI) => modalI.customId === "full-setup-modal", time: 5 * 60 * 1_000 })
        .then(async (modalI: ModalSubmitInteraction) => {
          const logChannelId = modalI.fields.getTextInputValue("logChannelIdInput");

          const replyEmbed = new EmbedBuilder()
            .setColor(Color.DiscordEmbedBackground)
            .setTitle(`Setup completed`)
            .addFields(
              {
                name: `Guild ID`,
                value: `${modalI.guild?.id ?? "No guild ID found"}`,
                inline: true,
              },
              {
                name: `Logging channel`,
                value: `<#${logChannelId}>`,
                inline: true,
              }
            )
            .setFooter({
              text: "Incorrect information? Re-run the setup command.",
            });

          await GuildModel.findOneAndUpdate(
            {
              GuildId: modalI.guild?.id,
            },
            {
              GuildLogChannel: logChannelId,
            }
          ).catch(async () => {
            return modalI.reply({ content: "An error occurred while saving the data.", ephemeral: true });
          });

          return modalI.reply({ embeds: [replyEmbed], ephemeral: true });
        })
        .catch(async () => {
          return buttonI.reply({ content: "Setup timed out.", ephemeral: true });
        });
    })
    .on("end", () => {
      return void interaction.editReply({
        components: [],
      });
    });
}
