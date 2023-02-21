import { EmbedBuilder, PermissionsBitField, ChatInputCommandInteraction } from "discord.js";

export function raiseUserPermissionsError(interaction: ChatInputCommandInteraction, permission: bigint) {
  const embed = new EmbedBuilder()
    .setTitle(`Permissions Error  •  \`/${interaction.commandName}\``)
    .setDescription(`:x: You do not have the \`${new PermissionsBitField(permission).toArray()}\` permission!`)
    .setColor(0xed4245);
  return interaction.reply({ embeds: [embed], ephemeral: true });
}

export function raiseBotPermissionsError(interaction: ChatInputCommandInteraction, permission: bigint) {
  const embed = new EmbedBuilder()
    .setTitle(`Permissions Error  •  \`/${interaction.commandName}\``)
    .setDescription(`:x: I do not have the \`${new PermissionsBitField(permission).toArray()}\` permission!`)
    .setColor(0xed4245);
  return interaction.reply({ embeds: [embed], ephemeral: true });
}

export function raiseUserHierarchyError(interaction: ChatInputCommandInteraction) {
  const embed = new EmbedBuilder()
    .setTitle(`Hierarchy Error  •  \`/${interaction.commandName}\``)
    .setDescription(":x: You cannot perform this action on a member with a higher or equal role than you!")
    .setColor(0xed4245);
  return interaction.reply({ embeds: [embed], ephemeral: true });
}

export function raiseBotHierarchyError(interaction: ChatInputCommandInteraction) {
  const embed = new EmbedBuilder()
    .setTitle(`Hierarchy Error  •  \`/${interaction.commandName}\``)
    .setDescription(":x: I cannot perform this action on a member with a higher or equal role than me!")
    .setColor(0xed4245);
  return interaction.reply({ embeds: [embed], ephemeral: true });
}

export function raiseMiscellaneousError(
  interaction: ChatInputCommandInteraction,
  errTitle: string,
  description: string
) {
  const embed = new EmbedBuilder()
    .setTitle(`${errTitle}  •  \`/${interaction.commandName}\``)
    .setDescription(`:x: ${description}`)
    .setColor(0xed4245);
  return interaction.reply({ embeds: [embed], ephemeral: true });
}
