import {
  ApplicationCommandOptionType,
  EmbedBuilder,
  PermissionsBitField,
  type ChatInputCommandInteraction,
  type AutocompleteInteraction,
} from "discord.js";
import { Color } from "../../constants.js";
import {
  permissionToString,
  getCommands,
  damerAutocomplete,
  type ChatInputCommand,
  type ExtendedClient,
} from "../../utils/index.js";

export const RequiredPerms = {
  bot: [],
  user: [],
} as const;

export const DiagnoseCommand: ChatInputCommand = {
  name: "diagnose",
  description: "Test if a command is working",
  options: [
    {
      name: "command",
      description: "The name of the command to test",
      type: ApplicationCommandOptionType.String,
      required: true,
      autocomplete: true,
    },
  ],
  default_member_permissions: permissionToString(RequiredPerms.user),
  dm_permission: false,
} as const;

export async function autocomplete(interaction: AutocompleteInteraction) {
  const query = interaction.options.getFocused();
  const choices = await getCommands();

  await interaction.respond(damerAutocomplete(query, choices));
}

export async function execute(interaction: ChatInputCommandInteraction<"cached">, client: ExtendedClient) {
  const commandInput = interaction.options.getString("command", true).replace(/.*: /, "").toLowerCase();
  const commandData = client.interactions.get(commandInput);

  if (!commandData) return interaction.reply({ content: "❌ That command does not exist!", ephemeral: true });

  const replyEmbed = new EmbedBuilder();

  for (const perm of commandData.RequiredPerms.bot) {
    if (!interaction.guild.members.me?.permissions.has(perm)) {
      const missingPermission = new PermissionsBitField(perm).toArray();

      replyEmbed
        .setColor(Color.DiscordDanger)
        .setTitle(`❌ Diagnosed command \`${commandInput}\``)
        .setDescription(`Error! I am missing the following permissions: \`${missingPermission}\``)
        .setFooter({
          text: "Believe this is a mistake? Report it on our discord server!",
        });

      return interaction.reply({ embeds: [replyEmbed] });
    }
  }

  replyEmbed
    .setColor(Color.DiscordSuccess)
    .setTitle(`✅ Diagnosed command \`${commandInput}\``)
    .setDescription(`No anomalies found`)
    .setFooter({
      text: "Believe this is a mistake? Report it on our discord server!",
    });

  return interaction.reply({ embeds: [replyEmbed] });
}
