const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

const requiredBotPerms = {
  type: "flags",
  key: [PermissionFlagsBits.ManageChannels],
};

const requiredUserPerms = {
  type: "flags",
  key: [PermissionFlagsBits.ManageChannels],
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("lock")
    .setDescription("Lock the current channel"),
  async execute(interaction) {
    const modRole = interaction.guild.roles.cache.find((role) =>
      ["moderator", "mod", "Moderator", "Mod"].includes(role.name)
    );
    const helperRole = interaction.guild.roles.cache.find((role) =>
      ["helper", "Helper"].includes(role.name)
    );

    interaction.channel.permissionOverwrites
      .edit(interaction.guild.id, {
        SendMessages: false,
      })
      .catch((err) => {
        console.error(err);
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

    interaction.reply({
      content: `:lock: Channel locked!`,
      ephemeral: true,
    });
  },
  requiredBotPerms: requiredBotPerms,
  requiredUserPerms: requiredUserPerms,
};
