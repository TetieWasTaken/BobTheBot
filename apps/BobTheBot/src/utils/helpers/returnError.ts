import {
  EmbedBuilder,
  PermissionsBitField,
  type CommandInteraction,
  type ChatInputCommandInteraction,
} from "discord.js";
import { Color } from "../../constants.js";

/**
 * @param interaction - The command interaction to reply to
 * @param permission - The permission that the user is missing
 * @returns An interaction reply, with an error embed
 * @example
 * ```
 * if (!interaction.member?.permissions.has(PermissionFlagsBits.Administrator))
 *   return raiseUserPermissionsError(interaction, PermissionFlagsBits.Administrator);
 * ```
 */
export async function raiseUserPermissionsError(interaction: CommandInteraction<"cached">, permission: bigint) {
  const embed = new EmbedBuilder()
    .setTitle(`Permissions Error  •  \`/${interaction.commandName}\``)
    .setDescription(`❌ You do not have the \`${new PermissionsBitField(permission).toArray()}\` permission!`)
    .setColor(Color.DiscordDanger);
  return interaction.reply({ embeds: [embed], ephemeral: true });
}

/**
 * @param interaction - The command interaction to reply to
 * @param permission - The permission that the bot is missing
 * @returns An interaction reply, with an error embed
 * @example
 * ```
 * if (!interaction.guild?.me?.permissions.has(PermissionFlagsBits.Administrator))
 *  return raiseBotPermissionsError(interaction, PermissionFlagsBits.Administrator);
 * ```
 */
export async function raiseBotPermissionsError(interaction: CommandInteraction<"cached">, permission: bigint) {
  const embed = new EmbedBuilder()
    .setTitle(`Permissions Error  •  \`/${interaction.commandName}\``)
    .setDescription(`❌ I do not have the \`${new PermissionsBitField(permission).toArray()}\` permission!`)
    .setColor(Color.DiscordDanger);
  return interaction.reply({ embeds: [embed], ephemeral: true });
}

/**
 * @param interaction - The chat input command interaction to reply to
 * @returns An interaction reply, with an error embed
 */
export async function raiseUserHierarchyError(interaction: ChatInputCommandInteraction<"cached">) {
  const embed = new EmbedBuilder()
    .setTitle(`Hierarchy Error  •  \`/${interaction.commandName}\``)
    .setDescription("❌ You cannot perform this action on a member with a higher or equal role than you!")
    .setColor(Color.DiscordDanger);
  return interaction.reply({ embeds: [embed], ephemeral: true });
}

/**
 * @param interaction - The chat input command interaction to reply to
 * @returns An interaction reply, with an error embed
 */
export async function raiseBotHierarchyError(interaction: ChatInputCommandInteraction<"cached">) {
  const embed = new EmbedBuilder()
    .setTitle(`Hierarchy Error  •  \`/${interaction.commandName}\``)
    .setDescription("❌ I cannot perform this action on a member with a higher or equal role than me!")
    .setColor(Color.DiscordDanger);
  return interaction.reply({ embeds: [embed], ephemeral: true });
}

/**
 * @param interaction - The chat input command interaction to reply to
 * @param errTitle - The title of the error
 * @param description - The description of the error
 * @returns An interaction reply, with an error embed
 * @example
 * ```
 * await raiseMiscellaneousError(interaction, "Error", "Something went wrong while trying to fetch the data!");
 * ```
 */
export async function raiseMiscellaneousError(
  interaction: ChatInputCommandInteraction,
  errTitle: string,
  description: string
) {
  const embed = new EmbedBuilder()
    .setTitle(`${errTitle}  •  \`/${interaction.commandName}\``)
    .setDescription(`❌ ${description}`)
    .setColor(Color.DiscordDanger);
  return interaction.reply({ embeds: [embed], ephemeral: true });
}
