import { SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";

const requiredBotPerms = {
  type: "flags" as const,
  key: [] as const,
};

const requiredUserPerms = {
  type: "flags" as const,
  key: [] as const,
};

module.exports = {
  data: new SlashCommandBuilder().setName("ping").setDescription("Returns the bots's latency").setDMPermission(true),
  async execute(interaction: ChatInputCommandInteraction) {
    const sent = await interaction.reply({
      content: "Pinging...",
      fetchReply: true,
      ephemeral: true,
    });
    await interaction.editReply(
      `:heartbeat: Websocket heartbeat: \`${interaction.client.ws.ping}ms\`.\n:comet: Rountrip Latency: \`${
        sent.createdTimestamp - interaction.createdTimestamp
      }ms\``
    );
  },
  requiredBotPerms,
  requiredUserPerms,
};
