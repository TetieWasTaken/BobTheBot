import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from "discord.js";
import { Color } from "../../constants.js";
import { convertMS } from "../../utils/index.js";

const requiredBotPerms = {
  type: "flags" as const,
  key: [] as const,
};

const requiredUserPerms = {
  type: "flags" as const,
  key: [] as const,
};

module.exports = {
  data: new SlashCommandBuilder().setName("uptime").setDescription("Receive the bots's uptime").setDMPermission(true),
  async execute(interaction: ChatInputCommandInteraction<"cached">) {
    const embed = new EmbedBuilder()
      .setTitle("⏱️ Uptime")
      .setDescription(`${convertMS(interaction.client.uptime)}`)
      .setColor(interaction.guild?.members?.me?.displayHexColor ?? Color.DiscordPrimary)
      .setFooter({ text: `${interaction.client.uptime}ms` });

    return await interaction.reply({ embeds: [embed] });
  },
  requiredBotPerms: requiredBotPerms,
  requiredUserPerms: requiredUserPerms,
};
