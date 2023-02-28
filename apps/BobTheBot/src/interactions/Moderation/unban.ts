import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction } from "discord.js";

const requiredBotPerms = {
  type: "flags" as const,
  key: [PermissionFlagsBits.BanMembers] as const,
};

const requiredUserPerms = {
  type: "flags" as const,
  key: [PermissionFlagsBits.BanMembers] as const,
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unban")
    .setDescription("Unbans a user from the current guild")
    .addStringOption((option) => option.setName("userid").setDescription("discord id for unban").setRequired(true)),
  async execute(interaction: ChatInputCommandInteraction<"cached">) {
    const userId = interaction.options.getString("userid", true);

    await interaction.guild.members
      .unban(userId)
      .then(() => {
        return interaction.reply({
          content: `:scales:  <@${userId}> has been unbanned`,
          ephemeral: true,
        });
      })
      .catch(() => {
        return interaction.reply({
          content: "Something went wrong while unbanning this user, try manually unbanning them.",
          ephemeral: true,
        });
      });
  },
  requiredBotPerms: requiredBotPerms,
  requiredUserPerms: requiredUserPerms,
};
