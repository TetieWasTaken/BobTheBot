import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from "discord.js";
import { EconomyModel } from "../../models/index.js";
import { logger, requestItemData } from "../../utils/index.js";
import { Color } from "../../constants.js";

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
    .setName("inventory")
    .setDescription("View your inventory")
    .addIntegerOption((option) => option.setName("page").setDescription("The page you want to view").setRequired(false))
    .addUserOption((option) =>
      option.setName("user").setDescription("The user you want to view the inventory of").setRequired(false)
    ),
  async execute(interaction: ChatInputCommandInteraction<"cached">) {
    const page = interaction.options.getInteger("page") ?? 1;
    const user = interaction.options.getUser("user") ?? interaction.user;
    const member = interaction.options.getMember("user") ?? interaction.member;

    const data = await EconomyModel.findOne({
      UserId: user.id,
    });

    if (!data || data.Inventory.length === 0) {
      const inventoryEmbed = new EmbedBuilder()
        .setAuthor({
          name: `${member.displayName}'s inventory`,
          iconURL: user.displayAvatarURL(),
        })
        .setDescription("This us'r is hath broken")
        .setFooter({
          text: `Page 1/1`,
        })
        .setColor(Color.DiscordWarning);

      return interaction.reply({
        embeds: [inventoryEmbed],
      });
    } else {
      const inventoryEmbed = new EmbedBuilder()
        .setAuthor({
          name: `${member.displayName}'s inventory`,
          iconURL: user.displayAvatarURL(),
        })
        .setFooter({
          text: `Page ${page}/${Math.ceil(data.Inventory.length / 5)}`,
        })
        .setColor(Color.DiscordEmbedBackground);
      for (let i = 0; i < 5; i++) {
        if (data.Inventory[i + (page - 1) * 5]) {
          try {
            const itemData = await requestItemData(data.Inventory[i + (page - 1) * 5].id);

            if (!itemData) return;

            inventoryEmbed.addFields({
              name: `${itemData.name} — ${data.Inventory[i].amount}`,
              value: `*ID* \`${data.Inventory[i].id}\` — ${itemData.type}`,
              inline: false,
            });
          } catch (err) {
            logger.error(err);
            inventoryEmbed.addFields({
              name: `Unknown Item — ${data.Inventory[i].amount}`,
              value: `*ID* \`${data.Inventory[i].id}\` — Unknown Type`,
              inline: false,
            });
            continue;
          }
        }
      }
      return interaction.reply({
        embeds: [inventoryEmbed],
      });
    }
  },
  requiredBotPerms: requiredBotPerms,
  requiredUserPerms: requiredUserPerms,
};
