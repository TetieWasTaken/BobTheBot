import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
} from "discord.js";

import { Color } from "../../constants.js";

const requiredBotPerms = {
  type: "flags" as const,
  key: [] as const,
};

const requiredUserPerms = {
  type: "flags" as const,
  key: [PermissionFlagsBits.Administrator] as const,
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("announce")
    .setDescription("Announce a message to the server")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("embed")
        .setDescription("Announce a message to the server in an embed")
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("Channel to announce the message in")
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("message")
        .setDescription("Announce a message to the server in a normal message")
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("Channel to announce the message in")
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText)
        )
        .addStringOption((option) => option.setName("message").setDescription("Message to announce").setRequired(true))
    ),
  async execute(interaction: ChatInputCommandInteraction<"cached">) {
    const channel = interaction.options.getChannel("channel", true);

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
        .setMaxLength(2048)
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

      interaction.showModal(modal);

      interaction
        .awaitModalSubmit({ filter: (i) => i.customId === "announce-embed-modal", time: 5 * 60 * 1000 })
        .then(async (i) => {
          const title = i.fields.getTextInputValue("title-input");
          const description = i.fields.getTextInputValue("description-input");
          const authorName = i.fields.getTextInputValue("author-name-input");
          const footerText = i.fields.getTextInputValue("footer-text-input");
          let color: any =
            i.fields.getTextInputValue("color-input").length > 0
              ? i.fields.getTextInputValue("color-input")
              : "Default";

          if (title.length <= 1 && description.length <= 1 && authorName.length <= 1 && footerText.length <= 1)
            return i.reply({
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
            else color = colors[color] ?? parseInt(color.replace("#", ""), 16);
          } else if (Array.isArray(color)) {
            color = (color[0] << 16) + (color[1] << 8) + color[2];
          }

          if (color < 0 || color > 0xffffff)
            return i.reply({
              embeds: [
                new EmbedBuilder()
                  .setTitle("Color Range Error")
                  .setDescription("Color must be within the range 0 - 16777215 (0xFFFFFF): " + color)
                  .setColor(Color.DiscordDanger),
              ],
              ephemeral: true,
            });
          if (Number.isNaN(color))
            return i.reply({
              embeds: [
                new EmbedBuilder()
                  .setTitle("Color Convert Error")
                  .setDescription("Unable to convert color to a number: " + color)
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

          // @ts-ignore
          channel.send({ embeds: [embed] });

          return i.reply({
            content: `:mega: Embed announced successfully! <#${channel.id}>`,
            ephemeral: true,
          });
        })
        .catch(async (err) => {
          if (err.message.endsWith("time")) {
            const replyEmbed = new EmbedBuilder()
              .setColor(Color.DiscordDanger)
              .setTitle(`Announcement failed`)
              .setDescription(`You took too long to respond. Please try again.`);
            return interaction.followUp({ embeds: [replyEmbed], ephemeral: true });
          } else {
            console.log(err);
            const replyEmbed = new EmbedBuilder()
              .setColor(Color.DiscordDanger)
              .setTitle(`Announcement failed`)
              .setDescription(`An error occurred. Please try again.`);
            return interaction.followUp({ embeds: [replyEmbed], ephemeral: true });
          }
        });
    } else if (interaction.options.getSubcommand() === "message") {
      const message = interaction.options.getString("message");

      // @ts-ignore
      channel.send(message);

      return interaction.reply({
        content: `:mega: Message announced successfully! <#${channel.id}>`,
        ephemeral: true,
      });
    }

    return;
  },
  requiredBotPerms: requiredBotPerms,
  requiredUserPerms: requiredUserPerms,
};
