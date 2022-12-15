const GuildSchema = require("../models/GuildModel");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "interactionCreate",
  once: false,
  async execute(interaction) {
    if (interaction.isCommand()) {
      if (interaction.isMessageContextMenuCommand()) {
        const guildData = await GuildSchema.findOne({
          GuildId: interaction.guild.id,
        });

        if (guildData && guildData.GuildLogChannel !== null) {
          const logChannel = await Promise.resolve(
            interaction.guild.channels.fetch(guildData.GuildLogChannel)
          );

          let userNickname = ` (${interaction.member.nickname})`;
          if (userNickname == " (null)") {
            userNickname = "";
          }

          logChannel.send({
            embeds: [
              new EmbedBuilder()
                .setColor(0xff6333)
                .setAuthor({
                  name:
                    `${interaction.member.user.username}#${interaction.member.user.discriminator}` +
                    userNickname +
                    " | Message reported",
                  iconURL: `${interaction.member.user.displayAvatarURL()}`,
                })
                .addFields(
                  {
                    name: `Channel`,
                    value: `${interaction.channel}`,
                    inline: false,
                  },
                  {
                    name: `Message`,
                    value: `${interaction.targetMessage.content}`,
                    inline: false,
                  },
                  {
                    name: `ID`,
                    value: `\`\`\`ini\nUser = ${interaction.user.id}\nID = ${interaction.id}\`\`\``,
                    inline: false,
                  }
                )
                .setTimestamp(),
            ],
          });

          return interaction.reply({
            content: `Message reported successfully.\n\`\`\`${interaction.targetMessage.content}\`\`\``,
            ephemeral: true,
          });
        } else {
          return interaction.reply({
            content:
              "Unable to report message: this server has not set up a logging channel.",
            ephemeral: true,
          });
        }
      }

      const command = interaction.client.commands.get(interaction.commandName);

      if (!command) return;

      try {
        await command.execute(interaction);
      } catch (err) {
        if (err) console.error(err);
        await interaction.reply({
          content: "An error occured while executing that command.",
          ephemeral: true,
        });
      }
      guildData = await GuildSchema.findOne({
        GuildId: interaction.guild.id,
      });
      if (guildData && guildData.GuildLogChannel !== null) {
        const logChannel = await Promise.resolve(
          interaction.guild.channels.fetch(guildData.GuildLogChannel)
        );

        let userNickname = ` (${interaction.member.nickname})`;
        let repliedMessage = await Promise.resolve(interaction.fetchReply());
        repliedMessage = repliedMessage.toString();

        const loggingEmojis = [
          ":gift: G",
          ":gift: R",
          ":hammer:",
          ":athletic_shoe:",
          ":mute:",
          ":unmute:",
          "rabbit2",
          ":turtle:",
          "sloth",
          ":scales:",
          ":unlock:",
          ":lock:",
          ":warning:",
          ":mag:",
          ":slot_machine:",
          ":card_index:",
          ":mega:",
        ];

        if (!loggingEmojis.some((elem) => repliedMessage.startsWith(elem))) {
          return;
        }

        if (userNickname == " (null)") {
          userNickname = "";
        }

        const logEmbed = new EmbedBuilder()
          .setColor(0xff6333)
          .setAuthor({
            name:
              `${interaction.member.user.username}#${interaction.member.user.discriminator}` +
              userNickname +
              " | Command executed",
            iconURL: `${interaction.member.user.displayAvatarURL()}`,
          })
          .addFields(
            {
              name: `Channel`,
              value: `${interaction.channel}`,
              inline: false,
            },
            {
              name: `Command executed`,
              value: `\`${interaction.commandName}\``,
              inline: false,
            },
            {
              name: `ID`,
              value: `\`\`\`ini\nUser = ${interaction.user.id}\nID = ${interaction.id}\`\`\``,
              inline: false,
            }
          )
          .setTimestamp();
        logChannel.send({ embeds: [logEmbed] });
      }
    }

    if (interaction.isButton()) {
      const button = interaction.client.buttons.get(interaction.customId);
      if (!button) return new Error("No code for button!");

      try {
        await button.execute(interaction);
      } catch (err) {
        console.log(err);
      }
    }

    if (interaction.isModalSubmit()) {
      if (interaction.customId === "full-setup-modal") {
        const logChannelId =
          interaction.fields.getTextInputValue("logChannelIdInput");

        const replyEmbed = new EmbedBuilder()
          .setColor(0xffffff)
          .setTitle(`Setup completed`)
          .addFields(
            {
              name: `Guild ID`,
              value: `${interaction.guild.id}`,
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

        await interaction.reply({ embeds: [replyEmbed], ephemeral: true });

        await GuildSchema.findOneAndUpdate(
          {
            GuildId: interaction.guild.id,
          },
          {
            GuildLogChannel: logChannelId,
          }
        );
      }
    }
  },
};
