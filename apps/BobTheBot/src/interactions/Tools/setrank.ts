import { SlashCommandBuilder, PermissionFlagsBits, type ChatInputCommandInteraction } from "discord.js";
import { LevelModel } from "../../models/index.js";

const requiredBotPerms = {
  type: "flags" as const,
  key: [] as const,
};

const requiredUserPerms = {
  type: "flags" as const,
  key: [PermissionFlagsBits.Administrator] as const,
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setrank")
    .setDescription("Sets the rank of a user")
    .addUserOption((option) => option.setName("target").setDescription("The user to set the rank of").setRequired(true))
    .addIntegerOption((option) =>
      option.setName("rank").setDescription("The rank to set the user to").setRequired(true)
    )
    .setDefaultMemberPermissions(...requiredUserPerms.key)
    .setDMPermission(false),
  async execute(interaction: ChatInputCommandInteraction<"cached">) {
    const user = interaction.options.getUser("target", true);
    const rank = interaction.options.getInteger("rank", true);

    if (rank <= 0) {
      return interaction.reply({
        content: ":wrench: You cannot set a user's rank to a negative number!",
        ephemeral: true,
      });
    }

    const xpForLevel = (desiredRank: number) => 50 * (desiredRank + 1) ** 2 + 50;

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
      data.save();
    }

    return interaction.reply({
      content: `:slot_machine: Set \`${user.tag}\`'s rank to ${rank}!`,
      ephemeral: true,
    });
  },
  requiredBotPerms: requiredBotPerms,
  requiredUserPerms: requiredUserPerms,
};
