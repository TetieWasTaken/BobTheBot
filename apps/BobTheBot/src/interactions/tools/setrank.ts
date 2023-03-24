import { ApplicationCommandOptionType, type ChatInputCommandInteraction } from "discord.js";
import { LevelModel } from "../../models/index.js";
import { permissionToString, logger, type ChatInputCommand } from "../../utils/index.js";

export const RequiredPerms = {
  bot: [],
  user: [],
} as const;

export const SetrankCommand: ChatInputCommand = {
  name: "setrank",
  description: "Set a user's rank",
  options: [
    {
      name: "user",
      description: "The user to set the rank of",
      type: ApplicationCommandOptionType.User,
      required: true,
    },
    {
      name: "rank",
      description: "The rank to set the user to",
      type: ApplicationCommandOptionType.Integer,
      required: true,
    },
  ],
  default_member_permissions: permissionToString(RequiredPerms.user),
  dm_permission: false,
} as const;

/**
 * @param desiredRank - The rank to get the XP for
 * @returns The amount of XP required to reach the desired rank
 */
const xpForLevel = (desiredRank: number) => 50 * (desiredRank + 1) ** 2 + 50;

export async function execute(interaction: ChatInputCommandInteraction<"cached">) {
  const user = interaction.options.getUser("target", true);
  const rank = interaction.options.getInteger("rank", true);

  if (rank <= 0) {
    return interaction.reply({
      content: ":wrench: You cannot set a user's rank to a negative number!",
      ephemeral: true,
    });
  }

  let data = await LevelModel.findOneAndUpdate(
    { GuildId: interaction.guild.id, UserId: user.id },
    { UserXP: xpForLevel(rank), UserLevel: rank }
  );

  if (!data) {
    data = new LevelModel({
      GuildId: interaction.guild.id,
      UserId: user.id,
      UserXP: xpForLevel(rank),
      UserLevel: rank,
    });
    await data.save().catch((error: Error) => logger.error(error));
  }

  return interaction.reply({
    content: `:slot_machine: Set \`${user.tag}\`'s rank to ${rank}!`,
    ephemeral: true,
  });
}
