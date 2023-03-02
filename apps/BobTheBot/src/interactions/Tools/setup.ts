import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
} from "discord.js";
import { GuildModel } from "../../models/index.js";
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
  data: new SlashCommandBuilder().setName("setup").setDescription("Set up the bot for your server"),
  async execute(interaction: ChatInputCommandInteraction<"cached">) {
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
      data.save();
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

    return interaction.reply({
      embeds: [replyEmbed],
      components: [new ActionRowBuilder<ButtonBuilder>().addComponents(button)],
    });
  },
  requiredBotPerms: requiredBotPerms,
  requiredUserPerms: requiredUserPerms,
};
