import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from "discord.js";
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
  data: new SlashCommandBuilder()
    .setName("roles")
    .setDescription("Returns a list of all roles in the current guild")
    .setDMPermission(false),
  async execute(interaction: ChatInputCommandInteraction<"cached">) {
    const roles = await Promise.resolve(
      interaction.guild.roles.fetch().then((roles) => {
        return roles
          .filter((role) => role.id !== interaction.guild.id)
          .toJSON()
          .join("\n");
      })
    );
    const replyEmbed = new EmbedBuilder()
      .setColor(interaction.guild?.members?.me?.displayHexColor ?? Color.DiscordPrimary)
      .addFields({
        name: "Roles",
        value: `${roles}`,
        inline: true,
      })
      .setFooter({ text: `${interaction.guild.id}` })
      .setTimestamp();

    interaction.reply({
      embeds: [replyEmbed],
    });
  },
  requiredBotPerms: requiredBotPerms,
  requiredUserPerms: requiredUserPerms,
};
