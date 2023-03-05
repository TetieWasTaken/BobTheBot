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
    .setName("unlock")
    .setDescription("unlock the current channel")
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
        SendMessages: null,
      })
      .catch((err) => {
        console.error(err);
      });
    if (!(typeof modRole === "undefined")) {
      interaction.channel.permissionOverwrites.edit(modRole, {
        SendMessages: null,
      });
    }
    if (!(typeof helperRole === "undefined")) {
      interaction.channel.permissionOverwrites.edit(helperRole, {
        SendMessages: null,
      });
    }

    return interaction.reply({
      content: `:unlock: Channel unlocked!`,
      ephemeral: true,
    });
  },
  requiredBotPerms: requiredBotPerms,
  requiredUserPerms: requiredUserPerms,
};
