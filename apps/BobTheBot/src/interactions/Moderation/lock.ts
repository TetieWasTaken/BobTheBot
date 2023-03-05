import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction, ChannelType } from "discord.js";

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
    .setName("lock")
    .setDescription("Lock the current channel")
    .setDefaultMemberPermissions(...requiredUserPerms.key),
  async execute(interaction: ChatInputCommandInteraction<"cached">) {
    if (!interaction.channel?.isTextBased() || interaction.channel.type !== ChannelType.GuildText)
      return interaction.reply({ content: "Something went wrong", ephemeral: true });

    const modRole = interaction.guild.roles.cache.find((role) =>
      ["moderator", "mod", "Moderator", "Mod"].includes(role.name)
    );
    const helperRole = interaction.guild.roles.cache.find((role) => ["helper", "Helper"].includes(role.name));

    interaction.channel.permissionOverwrites
      .edit(interaction.guild.id, {
        SendMessages: false,
      })
      .catch(() => {
        return interaction.reply({
          content: `:x: Something went wrong while locking the channel`,
          ephemeral: true,
        });
      });
    if (!(typeof modRole === "undefined")) {
      interaction.channel.permissionOverwrites.edit(modRole, {
        SendMessages: true,
      });
    }
    if (!(typeof helperRole === "undefined")) {
      interaction.channel.permissionOverwrites.edit(helperRole, {
        SendMessages: true,
      });
    }

    return interaction.reply({
      content: `:lock: Channel locked!`,
      ephemeral: true,
    });
  },
  requiredBotPerms: requiredBotPerms,
  requiredUserPerms: requiredUserPerms,
};
