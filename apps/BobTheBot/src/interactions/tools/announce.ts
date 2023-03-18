import {
  EmbedBuilder,
  PermissionFlagsBits,
  ChannelType,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ApplicationCommandOptionType,
  type ChatInputCommandInteraction,
} from "discord.js";
import { Color } from "../../constants.js";
import { logger, permissionToString, type ChatInputCommand } from "../../utils/index.js";

export const RequiredPerms = {
  bot: [],
  user: [PermissionFlagsBits.Administrator | PermissionFlagsBits.ManageGuild],
} as const;

export const AnnounceCommand: ChatInputCommand = {
  name: "announce",
  description: "Announces a message to a channel",
  options: [
    {
      name: "embed",
      description: "Whether or not to use an embed",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "channel",
          description: "The channel to send the message to",
          type: ApplicationCommandOptionType.Channel,
          channel_types: [ChannelType.GuildText],
          required: true,
        },
      ],
    },
    {
      name: "plain",
      description: "Whether or not to use plain text",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "channel",
          description: "The channel to send the message to",
          type: ApplicationCommandOptionType.Channel,
          channel_types: [ChannelType.GuildText],
          required: true,
        },
        {
          name: "message",
          description: "The message to send",
          type: ApplicationCommandOptionType.String,
          required: true,
        },
      ],
    },
  ],
  default_member_permissions: permissionToString(RequiredPerms.user),
  dm_permission: false,
} as const;

export async function execute(interaction: ChatInputCommandInteraction<"cached">) {
  const channel = interaction.options.getChannel("channel", true);
  if (!channel.isTextBased()) return interaction.reply({ content: "Something went wrong", ephemeral: true });

  if (!interaction.guild.members.me) return interaction.reply({ content: "Something went wrong", ephemeral: true });

  if (!channel.permissionsFor(interaction.guild.members.me).has(PermissionFlagsBits.SendMessages))
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(Color.DiscordDanger)
          .setTitle(`Announcement failed`)
          .setDescription(`I do not have permissions to send messages in <#${channel.id}>!`),
      ],
      ephemeral: true,
    });

  if (interaction.options.getSubcommand() === "embed") {
    const modal = new ModalBuilder().setCustomId("announce-embed-modal").setTitle("Announce Embed");

    const titleInput = new TextInputBuilder()
      .setCustomId("title-input")
      .setLabel("Title")
      .setMaxLength(256)
      .setMinLength(1)
      .setPlaceholder("Enter a title for the embed")
      .setRequired(false)
      .setStyle(TextInputStyle.Short);

    const descriptionInput = new TextInputBuilder()
      .setCustomId("description-input")
      .setLabel("Description")
      .setMinLength(1)
      .setPlaceholder("Enter a description for the embed")
      .setRequired(false)
      .setStyle(TextInputStyle.Paragraph);

    const authorNameInput = new TextInputBuilder()
      .setCustomId("author-name-input")
      .setLabel("Author Name")
      .setMaxLength(256)
      .setMinLength(1)
      .setPlaceholder("Enter a name for the embed author")
      .setRequired(false)
      .setStyle(TextInputStyle.Short);

    const footerTextInput = new TextInputBuilder()
      .setCustomId("footer-text-input")
      .setLabel("Footer Text")
      .setMaxLength(2_048)
      .setMinLength(1)
      .setPlaceholder("Enter a text for the embed footer")
      .setRequired(false)
      .setStyle(TextInputStyle.Short);

    const colorInput = new TextInputBuilder()
      .setCustomId("color-input")
      .setLabel("Color")
      .setPlaceholder("0x57f287, #57f287, Red, etc...")
      .setRequired(false)
      .setStyle(TextInputStyle.Short);

    const firstActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(titleInput);
    const secondActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(descriptionInput);
    const thirdActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(authorNameInput);
    const fourthActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(footerTextInput);
    const fifthActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(colorInput);

    modal.addComponents(firstActionRow, secondActionRow, thirdActionRow, fourthActionRow, fifthActionRow);

    await interaction.showModal(modal).catch((error) => logger.error(error));

    await interaction
      .awaitModalSubmit({ filter: (modalI) => modalI.customId === "announce-embed-modal", time: 5 * 60 * 1_000 })
      .then(async (modalI) => {
        const title = modalI.fields.getTextInputValue("title-input");
        const description = modalI.fields.getTextInputValue("description-input");
        const authorName = modalI.fields.getTextInputValue("author-name-input");
        const footerText = modalI.fields.getTextInputValue("footer-text-input");
        let color: any =
          modalI.fields.getTextInputValue("color-input").length > 0
            ? modalI.fields.getTextInputValue("color-input")
            : "Default";

        if (title.length <= 1 && description.length <= 1 && authorName.length <= 1 && footerText.length <= 1)
          return modalI.reply({
            embeds: [
              new EmbedBuilder()
                .setTitle("Content Error")
                .setDescription("You must provide at least one field to announce an embed")
                .setColor(Color.DiscordDanger),
            ],
          });

        const colors: Record<string, number> = {
          default: 0x000000,
          white: 0xffffff,
          aqua: 0x1abc9c,
          green: 0x57f287,
          blue: 0x3498db,
          yellow: 0xfee75c,
          purple: 0x9b59b6,
          luminousvividpink: 0xe91e63,
          fuchsia: 0xeb459e,
          gold: 0xf1c40f,
          orange: 0xe67e22,
          red: 0xed4245,
          grey: 0x95a5a6,
          navy: 0x34495e,
          darkaqua: 0x11806a,
          darkgreen: 0x1f8b4c,
          darkblue: 0x206694,
          darkpurple: 0x71368a,
          darkvividpink: 0xad1457,
          darkgold: 0xc27c0e,
          darkorange: 0xa84300,
          darkred: 0x992d22,
          darkgrey: 0x979c9f,
          darkergrey: 0x7f8c8d,
          lightgrey: 0xbcc0c0,
          darknavy: 0x2c3e50,
          blurple: 0x5865f2,
          greyple: 0x99aab5,
          darkbutnotblack: 0x2c2f33,
          notquiteblack: 0x23272a,
        };

        // Discord.JS ColorResolvable
        if (typeof color === "string") {
          color = color.toLowerCase().replace(" ", "");
          if (color === "random") color = Math.floor(Math.random() * (0xffffff + 1));
          else if (color === "default") color = 0;
          else color = colors[color] ?? Number.parseInt(color.replace("#", ""), 16);
        } else if (Array.isArray(color)) {
          // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
          color = (color[0] << 16) + (color[1] << 8) + color[2];
        }

        if (color < 0 || color > 0xffffff)
          return modalI.reply({
            embeds: [
              new EmbedBuilder()
                .setTitle("Color Range Error")
                .setDescription(`Color must be within the range 0 - 16777215 (0xFFFFFF): ${color}`)
                .setColor(Color.DiscordDanger),
            ],
            ephemeral: true,
          });
        if (Number.isNaN(color))
          return modalI.reply({
            embeds: [
              new EmbedBuilder()
                .setTitle("Color Convert Error")
                .setDescription(`Unable to convert color to a number: ${color}`)
                .setColor(Color.DiscordDanger),
            ],
            ephemeral: true,
          });

        const embed = new EmbedBuilder()
          .setTitle(title.length > 0 ? title : null)
          .setDescription(description.length > 0 ? description : null)
          .setAuthor({ name: authorName.length > 0 ? authorName : "" })
          .setFooter({ text: footerText.length > 0 ? footerText : "" })
          .setColor(color);

        await channel.send({ embeds: [embed] }).catch(async () => {
          return interaction.reply({ content: `❌ Failed to send embed to <#${channel.id}>`, ephemeral: true });
        });

        return modalI.reply({
          content: `:mega: Embed announced successfully! <#${channel.id}>`,
          ephemeral: true,
        });
      })
      .catch(async (error) => {
        if (error.message.endsWith("time")) {
          const replyEmbed = new EmbedBuilder()
            .setColor(Color.DiscordDanger)
            .setTitle(`Announcement failed`)
            .setDescription(`You took too long to respond. Please try again.`);
          return interaction.followUp({ embeds: [replyEmbed], ephemeral: true });
        } else {
          logger.error(error);
          const replyEmbed = new EmbedBuilder()
            .setColor(Color.DiscordDanger)
            .setTitle(`Announcement failed`)
            .setDescription(`An error occurred. Please try again.`);
          return interaction.followUp({ embeds: [replyEmbed], ephemeral: true });
        }
      });
  } else if (interaction.options.getSubcommand() === "plain") {
    const message = interaction.options.getString("message", true);

    await channel.send(message).catch(async () => {
      return interaction.reply({ content: `❌ Failed to send message to <#${channel.id}>`, ephemeral: true });
    });

    return interaction.reply({
      content: `:mega: Message announced successfully! <#${channel.id}>`,
      ephemeral: true,
    });
  }
}
