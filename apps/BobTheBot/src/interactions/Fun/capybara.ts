import { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } from "discord.js";
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
  data: new SlashCommandBuilder().setName("capybara").setDescription("Get a random capybara image"),
  async execute(interaction: ChatInputCommandInteraction<"cached">) {
    const img = await fetch("https://api.capy.lol/v1/capybara?json=true").then((res) => res.json());

    const embed = new EmbedBuilder()
      .setTitle("Okay I pull up")
      .setImage(`${img.data.url}`)
      .setColor(interaction.guild?.members?.me?.displayHexColor ?? Color.DiscordPrimary)
      .setFooter({
        text: `Requested by ${interaction.user.tag}`,
        iconURL: `${interaction.user.displayAvatarURL()}`,
      });

    await interaction.reply({ embeds: [embed] });
  },
  requiredBotPerms: requiredBotPerms,
  requiredUserPerms: requiredUserPerms,
};
