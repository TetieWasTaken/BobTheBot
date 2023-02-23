import { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } from "discord.js";

const requiredBotPerms = {
  type: "flags" as const,
  key: [] as const,
};

const requiredUserPerms = {
  type: "flags" as const,
  key: [] as const,
};

module.exports = {
  data: new SlashCommandBuilder().setName("woof").setDescription("Get a random dog image!"),
  async execute(interaction: ChatInputCommandInteraction) {
    const res = await fetch("https:random.dog/woof.json").then((res) => res.json());
    const embed = new EmbedBuilder()
      .setTitle("Woof!")
      .setImage(res.url)
      .setColor(interaction.guild?.members?.me?.displayHexColor ?? 0x5865f2)
      .setTimestamp()
      .setFooter({
        text: `Requested by ${interaction.user.tag}`,
        iconURL: `${interaction.user.displayAvatarURL()}`,
      });

    await interaction.reply({ embeds: [embed] });
  },
  requiredBotPerms: requiredBotPerms,
  requiredUserPerms: requiredUserPerms,
};
