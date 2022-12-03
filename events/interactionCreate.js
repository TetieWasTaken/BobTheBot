const GuildSchema = require("../models/GuildModel");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "interactionCreate",
  once: false,
  async execute(interaction) {
    if (interaction.isButton()) {
      console.log("isButton interaction");
      const button = interaction.client.buttons.get(interaction.customId);
      console.log(button);
      if (!button) return new Error("No code for button!");

      try {
        console.log("trying button...");
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
          .addFields({
            name: `Guild ID`,
            value: `${interaction.guild.id}`,
            inline: true,
          })
          .addFields({
            name: `Logging channel`,
            value: `<#${logChannelId}>`,
            inline: true,
          })
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

    if (!interaction.isCommand()) return;

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
      const logChannel = interaction.guild.channels.cache.get(
        guildData.GuildLogChannel
      );

      let userNickname = ` (${interaction.member.nickname})`;
      let repliedMessage = await Promise.resolve(interaction.fetchReply());
      repliedMessage = repliedMessage.toString();

      const loggingEmojis = [
        ":gift:",
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
        "slot_machine",
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
        .addFields({
          name: `Channel`,
          value: `${interaction.channel}`,
          inline: false,
        })
        .addFields({
          name: `Command executed`,
          value: `\`${interaction.commandName}\``,
          inline: false,
        })
        .addFields({
          name: `ID`,
          value: `\`\`\`ini\nUser = ${interaction.user.id}\nID = ${interaction.id}\`\`\``,
          inline: false,
        })
        .setTimestamp();
      logChannel.send({ embeds: [logEmbed] });
    }
  },
};
