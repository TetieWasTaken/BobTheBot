import { SlashCommandBuilder, PermissionFlagsBits, type ChatInputCommandInteraction, Collection } from "discord.js";

const requiredBotPerms = {
  type: "flags" as const,
  key: [PermissionFlagsBits.ManageMessages] as const,
};

const requiredUserPerms = {
  type: "flags" as const,
  key: [PermissionFlagsBits.ManageMessages] as const,
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("purge")
    .setDescription("Purge a set amount of messages")
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("amount of messages to purge")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100)
    )
    .setDefaultMemberPermissions(...requiredUserPerms.key)
    .setDMPermission(false),
  async execute(interaction: ChatInputCommandInteraction<"cached">) {
    const amount = interaction.options.getInteger("amount", true);

    if (!interaction.channel) return interaction.reply({ content: "Something went wrong", ephemeral: true });

    const messages = await interaction.channel.bulkDelete(amount).catch(async () => {
      return interaction.reply({
        content: "Something went wrong while purging messages",
        ephemeral: true,
      });
    });

    if (!(messages instanceof Collection)) return;

    await interaction.reply({
      content: `:mag: Purged ${messages.size} messages`,
      ephemeral: true,
    });
  },
  requiredBotPerms,
  requiredUserPerms,
};
