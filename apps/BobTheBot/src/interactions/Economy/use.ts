import { SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";
import { EconomyModel } from "../../models/index.js";
import { useItem, requestItemData } from "../../utils/index.js";

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
    .setName("use")
    .setDescription("Use an item from your inventory.")
    .addStringOption((option) => option.setName("item").setDescription("The item to use").setRequired(true))
    .setDMPermission(true),
  async execute(interaction: ChatInputCommandInteraction<"cached">) {
    const itemInput = interaction.options.getString("item", true);
    const data = await EconomyModel.findOne({
      UserId: interaction.user.id,
    });

    if (!data) {
      return interaction.reply({
        content: `You do not have this item`,
        ephemeral: true,
      });
    }

    const itemIndex = data.Inventory.findIndex((item) => item.id === itemInput.toLowerCase());

    if (itemIndex === -1) {
      return interaction.reply({
        content: `You do not have this item`,
        ephemeral: true,
      });
    }

    const item = await requestItemData(itemInput);

    if (!item?.usable) {
      return interaction.reply({
        content: `You cannot use this item!`,
        ephemeral: true,
      });
    }

    useItem(interaction, item, data);
    return data.save();
  },
  requiredBotPerms: requiredBotPerms,
  requiredUserPerms: requiredUserPerms,
};
