import { SlashCommandBuilder, EmbedBuilder, type ChatInputCommandInteraction } from "discord.js";
import { Color } from "../../constants.js";
import { LevelModel } from "../../models/index.js";

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
    .setName("rank")
    .setDescription("Returns xp and rank of given user in the server")
    .addUserOption((option) => option.setName("target").setDescription("User to display rank of").setRequired(false))
    .setDMPermission(false),
  async execute(interaction: ChatInputCommandInteraction) {
    const user = interaction.options.getUser("target") ?? interaction.user;

    if (user.bot) {
      return interaction.reply({
        content: "Bots don't have ranks!",
        ephemeral: true,
      });
    }

    if (!interaction.guild) return interaction.reply({ content: "Something went wrong!", ephemeral: true });

    const data = await LevelModel.findOne({
      GuildId: interaction.guild.id,
      UserId: user.id,
    });

    let userXP = 0;
    let userLevel = 0;

    if (data?.UserXP && data.UserLevel) {
      userXP = data.UserXP;
      userLevel = data.UserLevel;
    }

    const xpNeeded = 50 * (userLevel + 1) ** 2 + 50;

    const rankEmbed = new EmbedBuilder()
      .setColor(interaction.guild?.members?.me?.displayHexColor ?? Color.DiscordPrimary)
      .setAuthor({
        name: `${user.tag} (${user.id})`,
        iconURL: `${user.displayAvatarURL()}`,
      })
      .addFields(
        {
          name: `XP`,
          value: `\`${userXP}\`/\`${xpNeeded}\``,
          inline: true,
        },
        { name: `RANK`, value: `\`${userLevel}\``, inline: true }
      )
      .setTimestamp();

    return interaction.reply({
      embeds: [rankEmbed],
    });
  },
  requiredBotPerms,
  requiredUserPerms,
};
