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
  data: new SlashCommandBuilder().setName("meow").setDescription("Get a random cat image!"),
  async execute(interaction: ChatInputCommandInteraction<"cached">) {
    const embed = new EmbedBuilder()
      .setTitle("Meow!")
      .setImage(`https://cataas.com/cat?${Date.now()}`)
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
