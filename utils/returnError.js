const { EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
  raiseUserPermissionsError: (interaction, permission) => {
    const embed = new EmbedBuilder()
      .setTitle(`Permissions Error  •  \`/${interaction.commandName}\``)
      .setDescription(`:x: You do not have the \`${new PermissionsBitField(permission).toArray()}\` permission!`)
      .setColor(0xff0000);
    return interaction.reply({ embeds: [embed], ephemeral: true });
  },
  raiseBotPermissionsError: (interaction, permission) => {
    const embed = new EmbedBuilder()
      .setTitle(`Permissions Error  •  \`/${interaction.commandName}\``)
      .setDescription(`:x: I do not have the \`${new PermissionsBitField(permission).toArray()}\` permission!`)
      .setColor(0xff0000);
    return interaction.reply({ embeds: [embed], ephemeral: true });
  },
  raiseUserHierarchyError: (interaction) => {
    const embed = new EmbedBuilder()
      .setTitle(`Hierarchy Error  •  \`/${interaction.commandName}\``)
      .setDescription(":x: You cannot perform this action on a member with a higher or equal role than you!")
      .setColor(0xff0000);
    return interaction.reply({ embeds: [embed], ephemeral: true });
  },
  raiseBotHierarchyError: (interaction) => {
    const embed = new EmbedBuilder()
      .setTitle(`Hierarchy Error  •  \`/${interaction.commandName}\``)
      .setDescription(":x: I cannot perform this action on a member with a higher or equal role than me!")
      .setColor(0xff0000);
    return interaction.reply({ embeds: [embed], ephemeral: true });
  },
  raiseMiscellaneousError: (interaction, errTitle, description) => {
    const embed = new EmbedBuilder()
      .setTitle(`${errTitle}  •  \`/${interaction.commandName}\``)
      .setDescription(`:x: ${description}`)
      .setColor(0xff0000);
    return interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
