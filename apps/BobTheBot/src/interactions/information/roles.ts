import { EmbedBuilder, type ChatInputCommandInteraction } from "discord.js";
import { Color } from "../../constants.js";
import { permissionToString, type ChatInputCommand } from "../../utils/index.js";

export const RequiredPerms = {
  bot: [],
  user: [],
} as const;

export const RolesCommand: ChatInputCommand = {
  name: "roles",
  description: "Get a list of all roles on the server",
  default_member_permissions: permissionToString(RequiredPerms.user),
  dm_permission: false,
} as const;

export async function execute(interaction: ChatInputCommandInteraction<"cached">) {
  const roles = await interaction.guild.roles.fetch().then((roles) => {
    return roles
      .filter((role) => role.id !== interaction.guild.id)
      .toJSON()
      .join("\n");
  });

  const replyEmbed = new EmbedBuilder()
    .setColor(interaction.guild?.members?.me?.displayHexColor ?? Color.DiscordPrimary)
    .addFields({
      name: "Roles",
      value: `${roles}`,
      inline: true,
    })
    .setFooter({ text: `${interaction.guild.id}` })
    .setTimestamp();

  return interaction.reply({
    embeds: [replyEmbed],
  });
}
