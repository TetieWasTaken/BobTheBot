import { SlashCommandBuilder, EmbedBuilder, type ChatInputCommandInteraction } from "discord.js";
import { Color } from "../../constants.js";
import { EconomyModel } from "../../models/index.js";

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
    .setName("balance")
    .setDescription("Checks someone's balance")
    .addUserOption((option: any) => option.setName("user").setDescription("The user to check").setRequired(false))
    .setDMPermission(true),
  async execute(interaction: ChatInputCommandInteraction<"cached">) {
    const user = interaction.options.getUser("user") ?? interaction.user;

    const data = await EconomyModel.findOne({
      UserId: user.id,
    });

    if (!data) {
      const replyEmbed = new EmbedBuilder()
        .setTitle(`Balance of ${user.username}#${user.discriminator}`)
        .setColor(Color.DiscordDanger)
        .addFields(
          {
            name: "🏦  Bank",
            value: "₳ 0",
            inline: true,
          },
          {
            name: "💰  Wallet",
            value: "₳ 0",
            inline: true,
          },
          {
            name: "📈  Net Worth",
            value: "₳ 0",
            inline: false,
          }
        );

      return interaction.reply({
        embeds: [replyEmbed],
      });
    } else if (data) {
      const replyEmbed = new EmbedBuilder().setTitle(`balance of ${user.username}#${user.discriminator}`).addFields(
        {
          name: "🏦  Bank",
          value: `₳ ${data.Bank}`,
          inline: true,
        },
        {
          name: "💰  Wallet",
          value: `₳ ${data.Wallet}`,
          inline: true,
        },
        {
          name: "📈  Net Worth",
          value: `₳ ${data.NetWorth}`,
          inline: false,
        }
      );

      return interaction.reply({
        embeds: [replyEmbed],
      });
    }
  },
  requiredBotPerms,
  requiredUserPerms,
};
