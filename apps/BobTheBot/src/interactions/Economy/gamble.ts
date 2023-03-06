import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
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
    .setName("gamble")
    .setDescription("Gamble all your money away!")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("coinflip")
        .setDescription("Flip a coin and win or lose money!")
        .addIntegerOption((option) =>
          option
            .setName("amount")
            .setDescription("The amount of money you want to gamble")
            .setRequired(true)
            .setMinValue(10)
            .setMaxValue(100)
        )
        .addStringOption((option) =>
          option
            .setName("choice")
            .setDescription("Heads or Tails?")
            .setRequired(true)
            .addChoices({ name: "Heads", value: "heads" }, { name: "Tails", value: "tails" })
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("dice")
        .setDescription("Roll a dice and win or lose money!")
        .addIntegerOption((option) =>
          option
            .setName("amount")
            .setDescription("The amount of money you want to gamble")
            .setRequired(true)
            .setMinValue(10)
            .setMaxValue(99999)
        )
        .addIntegerOption((option) =>
          option
            .setName("number")
            .setDescription("Choose a number between 1 and 6")
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(6)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("slots")
        .setDescription("Spin the slots and win or lose money!")
        .addIntegerOption((option) =>
          option
            .setName("amount")
            .setDescription("The amount of money you want to gamble")
            .setRequired(true)
            .setMinValue(10)
            .setMaxValue(99999)
        )
    )
    .setDMPermission(true),
  cooldownTime: 60 * 5 * 1000,
  async execute(interaction: ChatInputCommandInteraction<"cached">) {
    let amount = interaction.options.getInteger("amount", true);

    let data = await EconomyModel.findOne({
      UserId: interaction.user.id,
    });

    if (!data || !data.Wallet || data.Wallet < amount) {
      return interaction.reply({
        content: "You don't have enough money to gamble!",
        ephemeral: true,
      });
    }

    data.NetWorth ??= 0;

    if (interaction.options.getSubcommand() === "coinflip") {
      const choice = interaction.options.getString("choice");

      const result = Math.floor(Math.random() * 2) + 1;
      const heads = 1;
      const tails = 2;

      if (choice === "heads" && result === heads) {
        interaction.reply({
          content: `🪙 You won ${amount / 2} coins!`,
        });
        data.Wallet += amount;
        data.NetWorth += amount;
      } else if (choice === "tails" && result === tails) {
        interaction.reply({
          content: `🪙 You won ${amount / 2} coins!`,
        });
        data.Wallet += amount / 2;
        data.NetWorth += amount / 2;
      } else {
        interaction.reply({
          content: `🪙 You lost ${amount} coins!`,
          ephemeral: true,
        });
        data.Wallet -= amount;
        data.NetWorth -= amount;
      }
    } else if (interaction.options.getSubcommand() === "dice") {
      const number = interaction.options.getInteger("number");

      const result = Math.floor(Math.random() * 6) + 1;

      if (number === result) {
        interaction.reply({
          content: `🎲 You won ${amount * 3} coins!`,
        });

        data.Wallet += amount * 3;
        data.NetWorth += amount * 3;
      } else {
        interaction.reply({
          content: `🎲 You lost ${amount} coins! Your choice: \`${number}\` | Result: \`${result}\``,
          ephemeral: true,
        });

        data.Wallet -= amount;
        data.NetWorth -= amount;
      }
    } else if (interaction.options.getSubcommand() === "slots") {
      const slot1 = Math.floor(Math.random() * 8) + 1;
      const slot2 = Math.floor(Math.random() * 8) + 1;
      const slot3 = Math.floor(Math.random() * 8) + 1;

      if (slot1 === slot2 && slot2 === slot3) {
        interaction.reply({
          content: `🎰 You won ${amount * 50} coins!`,
        });
        data.Wallet += amount * 50;
        data.NetWorth += amount * 50;
      } else {
        interaction.reply({
          content: `🎰 You lost ${amount} coins!`,
          ephemeral: true,
        });
        data.Wallet -= amount;
        data.NetWorth -= amount;
      }
    } else {
      return;
    }

    return data.save();
  },
  requiredBotPerms: requiredBotPerms,
  requiredUserPerms: requiredUserPerms,
};
