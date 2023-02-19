const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const EconomySchema = require("../../models/EconomyModel");
const { requestItemData } = require("../../utils/requestItemData");

const requiredBotPerms = {
  type: "flags",
  key: [],
};

const requiredUserPerms = {
  type: "flags",
  key: [],
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("inventory")
    .setDescription("View your inventory")
    .addIntegerOption((option) => option.setName("page").setDescription("The page you want to view").setRequired(false))
    .addUserOption((option) =>
      option.setName("user").setDescription("The user you want to view the inventory of").setRequired(false)
    ),
  async execute(interaction) {
    const page = interaction.options.getInteger("page") ?? 1;
    const user = interaction.options.getUser("user") ?? interaction.user;
    const member = interaction.options.getMember("user") ?? interaction.member;

    const data = await EconomySchema.findOne({
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
        .setColor(0x00ff00);

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
        .setColor(0x00ff00);
      for (let i = 0; i < 5; i++) {
        if (data.Inventory[i + (page - 1) * 5]) {
          try {
            const itemData = await requestItemData(data.Inventory[i + (page - 1) * 5].id);

            inventoryEmbed.addFields({
              name: `${itemData.name} — ${data.Inventory[i].amount}`,
              value: `*ID* \`${data.Inventory[i].id}\` — ${itemData.type}`,
              inline: false,
            });
          } catch (err) {
            console.log(err);
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
