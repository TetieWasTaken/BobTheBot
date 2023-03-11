import { SlashCommandBuilder, PermissionFlagsBits, type ChatInputCommandInteraction, ChannelType } from "discord.js";

const requiredBotPerms = {
  type: "flags" as const,
  key: [PermissionFlagsBits.ManageChannels] as const,
};

const requiredUserPerms = {
  type: "flags" as const,
  key: [PermissionFlagsBits.ManageChannels] as const,
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unlock")
    .setDescription("unlock the current channel")
    .setDefaultMemberPermissions(...requiredUserPerms.key)
    .setDMPermission(false),
  async execute(interaction: ChatInputCommandInteraction<"cached">) {
    if (!interaction.channel?.isTextBased() || interaction.channel.type !== ChannelType.GuildText)
      return interaction.reply({ content: "Something went wrong", ephemeral: true });

    const modRole = interaction.guild.roles.cache.find((role) =>
      ["moderator", "mod", "Moderator", "Mod"].includes(role.name)
    );
    const helperRole = interaction.guild.roles.cache.find((role) => ["helper", "Helper"].includes(role.name));

    await interaction.channel.permissionOverwrites
      .edit(interaction.guild.id, {
        SendMessages: null,
      })
      .catch(async () => {
        return interaction.reply({
          content: `:x: Something went wrong while unlocking the channel`,
          ephemeral: true,
        });
      });

    if (modRole) {
      await interaction.channel.permissionOverwrites.edit(modRole, {
        SendMessages: null,
      });
    }

    if (helperRole) {
      await interaction.channel.permissionOverwrites.edit(helperRole, {
        SendMessages: null,
      });
    }

    return interaction.reply({
      content: `:unlock: Channel unlocked!`,
      ephemeral: true,
    });
  },
  requiredBotPerms,
  requiredUserPerms,
};
