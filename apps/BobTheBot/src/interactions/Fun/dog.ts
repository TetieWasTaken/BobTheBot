import { SlashCommandBuilder, EmbedBuilder, type ChatInputCommandInteraction } from "discord.js";
import { Color } from "../../constants.js";

const requiredBotPerms = {
  type: "flags" as const,
  key: [] as const,
};

const requiredUserPerms = {
  type: "flags" as const,
  key: [] as const,
};

module.exports = {
  data: new SlashCommandBuilder().setName("woof").setDescription("Get a random dog image!").setDMPermission(true),
  async execute(interaction: ChatInputCommandInteraction) {
    const res = await fetch("https:random.dog/woof.json").then(async (res) => res.json());
    const embed = new EmbedBuilder()
      .setTitle("Woof!")
      .setImage(res.url)
      .setColor(interaction.guild?.members?.me?.displayHexColor ?? Color.DiscordPrimary)
      .setTimestamp()
      .setFooter({
        text: `Requested by ${interaction.user.tag}`,
        iconURL: `${interaction.user.displayAvatarURL()}`,
      });

    await interaction.reply({ embeds: [embed] });
  },
  requiredBotPerms,
  requiredUserPerms,
};
