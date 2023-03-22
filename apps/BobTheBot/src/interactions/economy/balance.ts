import { ApplicationCommandOptionType, EmbedBuilder, type ChatInputCommandInteraction } from "discord.js";
import { Color } from "../../constants.js";
import { EconomyModel } from "../../models/index.js";
import { permissionToString, type ChatInputCommand } from "../../utils/index.js";

export const RequiredPerms = {
  bot: [],
  user: [],
} as const;

export const BalanceCommand: ChatInputCommand = {
  name: "balance",
  description: "Checks a user's balance",
  options: [
    {
      name: "user",
      description: "The user to check the balance of",
      type: ApplicationCommandOptionType.User,
      required: false,
    },
  ],
  default_member_permissions: permissionToString(RequiredPerms.user),
  dm_permission: true,
} as const;

export async function execute(interaction: ChatInputCommandInteraction) {
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
}
