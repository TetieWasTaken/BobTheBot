const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  EmbedBuilder,
} = require("discord.js");

const requiredBotPerms = {
  type: "flags",
  key: [],
};

const requiredUserPerms = {
  type: "flags",
  key: [PermissionFlagsBits.Administrator],
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
  async execute(interaction) {
    const channel = interaction.options.getChannel("channel");

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

      const firstActionRow = new ActionRowBuilder().addComponents(titleInput);
      const secondActionRow = new ActionRowBuilder().addComponents(descriptionInput);
      const thirdActionRow = new ActionRowBuilder().addComponents(authorNameInput);
      const fourthActionRow = new ActionRowBuilder().addComponents(footerTextInput);
      const fifthActionRow = new ActionRowBuilder().addComponents(colorInput);

      modal.addComponents(firstActionRow, secondActionRow, thirdActionRow, fourthActionRow, fifthActionRow);

      interaction.showModal(modal);

      interaction
        .awaitModalSubmit({ filter: (i) => i.customId === "announce-embed-modal", time: 5 * 60 * 1000 })
        .then(async (i) => {
          const title = i.fields.getTextInputValue("title-input");
          const description = i.fields.getTextInputValue("description-input");
          const authorName = i.fields.getTextInputValue("author-name-input");
          const footerText = i.fields.getTextInputValue("footer-text-input");
          let color =
            i.fields.getTextInputValue("color-input").length > 0
              ? i.fields.getTextInputValue("color-input")
              : "Default";

          if (title.length <= 1 && description.length <= 1 && authorName.length <= 1 && footerText.length <= 1)
            return i.reply({
              embeds: [
                new EmbedBuilder()
                  .setTitle("Content Error")
                  .setDescription("You must provide at least one field to announce an embed")
                  .setColor(0xff0000),
              ],
            });

          const colors = {
            Default: 0x000000,
            White: 0xffffff,
            Aqua: 0x1abc9c,
            Green: 0x57f287,
            Blue: 0x3498db,
            Yellow: 0xfee75c,
            Purple: 0x9b59b6,
            LuminousVividPink: 0xe91e63,
            Fuchsia: 0xeb459e,
            Gold: 0xf1c40f,
            Orange: 0xe67e22,
            Red: 0xed4245,
            Grey: 0x95a5a6,
            Navy: 0x34495e,
            DarkAqua: 0x11806a,
            DarkGreen: 0x1f8b4c,
            DarkBlue: 0x206694,
            DarkPurple: 0x71368a,
            DarkVividPink: 0xad1457,
            DarkGold: 0xc27c0e,
            DarkOrange: 0xa84300,
            DarkRed: 0x992d22,
            DarkGrey: 0x979c9f,
            DarkerGrey: 0x7f8c8d,
            LightGrey: 0xbcc0c0,
            DarkNavy: 0x2c3e50,
            Blurple: 0x5865f2,
            Greyple: 0x99aab5,
            DarkButNotBlack: 0x2c2f33,
            NotQuiteBlack: 0x23272a,
          };

          // From Discord.JS
          if (typeof color === "string") {
            if (color === "Random") color = Math.floor(Math.random() * (0xffffff + 1));
            else if (color === "Default") color = 0;
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
                  .setColor(0xff0000),
              ],
              ephemeral: true,
            });
          if (Number.isNaN(color))
            return i.reply({
              embeds: [
                new EmbedBuilder()
                  .setTitle("Color Convert Error")
                  .setDescription("Unable to convert color to a number: " + color)
                  .setColor(0xff0000),
              ],
              ephemeral: true,
            });

          const embed = new EmbedBuilder()
            .setTitle(title.length > 0 ? title : null)
            .setDescription(description.length > 0 ? description : null)
            .setAuthor({ name: authorName.length > 0 ? authorName : null })
            .setFooter({ text: footerText.length > 0 ? footerText : null })
            .setColor(color);

          channel.send({ embeds: [embed] });

          return i.reply({
            content: `:mega: Embed announced successfully! <#${channel.id}>`,
            ephemeral: true,
          });
        })
        .catch(async (err) => {
          if (!channel.permissionsFor(interaction.guild.members.me).has(PermissionFlagsBits.SendMessages)) {
            const replyEmbed = new EmbedBuilder()
              .setColor(0xff0000)
              .setTitle(`Announcement failed`)
              .setDescription(`I do not have permissions to send messages in <#${channel.id}>!`);
            interaction.followUp({ embeds: [replyEmbed], ephemeral: true });
          } else if (err.message.endsWith("time")) {
            const replyEmbed = new EmbedBuilder()
              .setColor(0xff0000)
              .setTitle(`Announcement failed`)
              .setDescription(`You took too long to respond. Please try again.`);
            interaction.followUp({ embeds: [replyEmbed], ephemeral: true });
          } else {
            console.log(err);
            const replyEmbed = new EmbedBuilder()
              .setColor(0xff0000)
              .setTitle(`Announcement failed`)
              .setDescription(`An error occurred. Please try again.`);
            interaction.followUp({ embeds: [replyEmbed], ephemeral: true });
          }
        });
    } else if (interaction.options.getSubcommand() === "message") {
      const message = interaction.options.getString("message");

      if (!channel.permissionsFor(interaction.guild.members.me).has(PermissionFlagsBits.SendMessages)) {
        return interaction.reply({
          content: ":wrench: I do not have permissions to send messages in this channel!",
          ephemeral: true,
        });
      }

      channel.send(message);

      return interaction.reply({
        content: `:mega: Message announced successfully! <#${channel.id}>`,
        ephemeral: true,
      });
    }
  },
  requiredBotPerms: requiredBotPerms,
  requiredUserPerms: requiredUserPerms,
};
