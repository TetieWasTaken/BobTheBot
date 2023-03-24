import { EmbedBuilder, ApplicationCommandOptionType, type ChatInputCommandInteraction } from "discord.js";
import { Color } from "../../constants.js";
import { LevelModel } from "../../models/index.js";
import { permissionToString, type ChatInputCommand } from "../../utils/index.js";

export const RequiredPerms = {
  bot: [],
  user: [],
} as const;

export const RankCommand: ChatInputCommand = {
  name: "rank",
  description: "Shows your rank in the server",
  options: [
    {
      name: "user",
      description: "The user to show the rank of",
      type: ApplicationCommandOptionType.User,
      required: false,
    },
  ],
  default_member_permissions: permissionToString(RequiredPerms.user),
  dm_permission: false,
} as const;

export async function execute(interaction: ChatInputCommandInteraction<"cached">) {
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
}
