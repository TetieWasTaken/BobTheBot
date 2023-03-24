import { ApplicationCommandOptionType, EmbedBuilder, type ChatInputCommandInteraction } from "discord.js";
import { Color } from "../../constants.js";
import { EconomyModel } from "../../models/index.js";
import { permissionToString, requestItemData, logger, type ChatInputCommand } from "../../utils/index.js";

export const RequiredPerms = {
  bot: [],
  user: [],
} as const;

export const InventoryCommand: ChatInputCommand = {
  name: "inventory",
  description: "View a user's inventory",
  options: [
    {
      name: "user",
      description: "The user to view the inventory of",
      type: ApplicationCommandOptionType.User,
      required: false,
    },
    {
      name: "page",
      description: "The page to view",
      type: ApplicationCommandOptionType.Integer,
      required: false,
    },
  ],
  default_member_permissions: permissionToString(RequiredPerms.user),
  dm_permission: true,
} as const;

/**
 * @param member - The member to check
 * @returns Whether the member has a display name
 */
function hasDisplayName(member: any): member is { displayName: string } {
  return typeof member.displayName === "string";
}

export async function execute(interaction: ChatInputCommandInteraction) {
  let page = interaction.options.getInteger("page") ?? 1;
  const user = interaction.options.getUser("user") ?? interaction.user;
  const member = interaction.options.getMember("user") ?? interaction.member;

  const data = await EconomyModel.findOne({
    UserId: user.id,
  });

  if (!data || data.Inventory.length === 0) {
    const inventoryEmbed = new EmbedBuilder()
      .setAuthor({
        name: `${hasDisplayName(member) ? member.displayName : user.username}'s inventory`,
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
    if (page > Math.ceil(data.Inventory.length / 5)) page = Math.ceil(data.Inventory.length / 5);

    const inventoryEmbed = new EmbedBuilder()
      .setAuthor({
        name: `${hasDisplayName(member) ? member.displayName : user.username}'s inventory`,
        iconURL: user.displayAvatarURL(),
      })
      .setFooter({
        text: `Page ${page}/${Math.ceil(data.Inventory.length / 5)}`,
      })
      .setColor(Color.DiscordEmbedBackground);
    for (let index = 0; index < 5; index++) {
      if (data.Inventory[index + (page - 1) * 5]) {
        try {
          const itemData = await requestItemData(data.Inventory[index + (page - 1) * 5].id);

          if (!itemData) return;

          inventoryEmbed.addFields({
            name: `${itemData.name} — ${data.Inventory[index].amount}`,
            value: `*ID* \`${data.Inventory[index].id}\` — ${itemData.type}`,
            inline: false,
          });
        } catch (error) {
          logger.error(error);
          inventoryEmbed.addFields({
            name: `Unknown Item — ${data.Inventory[index].amount}`,
            value: `*ID* \`${data.Inventory[index].id}\` — Unknown Type`,
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
}
