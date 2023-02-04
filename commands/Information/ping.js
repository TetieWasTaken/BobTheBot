const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits } = require("discord.js");

const requiredBotPerms = {
  type: "flags",
  key: [PermissionFlagsBits.SendMessages],
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Returns the bots's latency"),
  async execute(interaction) {
    const sent = await interaction.reply({
      content: "Pinging...",
      fetchReply: true,
      ephemeral: true,
    });
    await interaction.editReply(
      `:heartbeat: Websocket heartbeat: \`${
        interaction.client.ws.ping
      }ms\`.\n:comet: Rountrip Latency: \`${
        sent.createdTimestamp - interaction.createdTimestamp
      }ms\``
    );
  },
  requiredBotPerms: requiredBotPerms,
};
