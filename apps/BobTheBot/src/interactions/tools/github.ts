import { ApplicationCommandOptionType, EmbedBuilder, type ChatInputCommandInteraction } from "discord.js";
import { Color } from "../../constants.js";
import {
  permissionToString,
  type IGithubUser,
  type IGithubRepository,
  type ChatInputCommand,
} from "../../utils/index.js";

export const RequiredPerms = {
  bot: [],
  user: [],
} as const;

export const GithubCommand: ChatInputCommand = {
  name: "github",
  description: "Search for a user or repository on GitHub",
  options: [
    {
      name: "user",
      description: "Search for a user on GitHub",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "username",
          description: "The username of the user to search for",

          type: ApplicationCommandOptionType.String,
          required: true,
        },
      ],
    },
    {
      name: "repository",
      description: "Search for a repository on GitHub",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "username",
          description: "The username of the owner/organization of the repository",
          type: ApplicationCommandOptionType.String,
          required: true,
        },
        {
          name: "repository",
          description: "The repository to search for",
          type: ApplicationCommandOptionType.String,
          required: true,
        },
      ],
    },
  ],
  default_member_permissions: permissionToString(RequiredPerms.user),
  dm_permission: true,
} as const;

export async function execute(interaction: ChatInputCommandInteraction) {
  const user = interaction.options.getString("username", true);

  const subcommand = interaction.options.getSubcommand();

  switch (subcommand) {
    case "user": {
      const res: IGithubUser = await fetch(`https://api.github.com/users/${user}`).then(async (res) => res.json());

      if (res.message) {
        return interaction.reply({
          content: `Unable to find requested user: \`${user}\``,
          ephemeral: true,
        });
      }

      try {
        const embed = new EmbedBuilder()
          .setColor(Color.DiscordPrimary)
          .setAuthor({
            name: res.login,
            url: res.html_url,
            iconURL: res.avatar_url,
          })
          .setTitle(res.name)
          .setURL(res.html_url)
          .addFields(
            { name: "Followers", value: `${res.followers}`, inline: true },
            { name: "Following", value: `${res.following}`, inline: true },
            {
              name: "Public Repos",
              value: `${res.public_repos ?? "None"}`,
              inline: true,
            },
            {
              name: "Public Gists",
              value: `${res.public_gists ?? "None"}`,
              inline: true,
            },
            { name: "Bio", value: `${res.bio ?? "None"}`, inline: true },
            {
              name: "Company",
              value: `${res.company ?? "None"}`,
              inline: true,
            },
            {
              name: "Location",
              value: `${res.location ?? "None"}`,
              inline: true,
            },
            { name: "Email", value: `${res.email ?? "None"}`, inline: true },
            {
              name: "Twitter",
              value: `${res.twitter_username ?? "None"}`,
              inline: true,
            },
            {
              name: "Hireable",
              value: `${res.hireable ?? "No"}`,
              inline: true,
            },
            {
              name: "Blog",
              value: `${res.blog === "" ? "None" : res.blog}`,
              inline: true,
            },
            { name: "Type", value: `${res.type}`, inline: true }
          )
          .setFooter({
            text: `ID: ${res.id} | Created at: ${new Date(res.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}`,
          });

        return interaction.reply({ embeds: [embed] });
      } catch {
        return interaction.reply({
          content: "An error occurred while trying to retrieve the user information.",
          ephemeral: true,
        });
      }
    }

    case "repository": {
      const repository = interaction.options.getString("repository");

      const res: IGithubRepository = await fetch(`https://api.github.com/repos/${user}/${repository}`).then(
        async (res) => res.json()
      );

      if (res.message) {
        return interaction.reply({
          content: "That repository does not exist.",
          ephemeral: true,
        });
      }

      try {
        const embed = new EmbedBuilder()
          .setColor(Color.DiscordPrimary)
          .setAuthor({
            name: res.owner.login,
            url: res.owner.html_url,
            iconURL: res.owner.avatar_url,
          })
          .setTitle(res.name)
          .setURL(res.html_url)
          .addFields(
            {
              name: "Stars",
              value: `${res.stargazers_count}`,
              inline: true,
            },
            { name: "Forks", value: `${res.forks_count}`, inline: true },
            {
              name: "Open Issues",
              value: `${res.open_issues_count}`,
              inline: true,
            },
            {
              name: "License",
              value: `${res.license?.name ?? "None"}`,
              inline: true,
            },
            {
              name: "Default Branch",
              value: `${res.default_branch}`,
              inline: true,
            }
          )
          .setFooter({
            text: `ID: ${res.id} | Created at: ${new Date(res.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}`,
          });
        return interaction.reply({ embeds: [embed] });
      } catch {
        return interaction.reply({
          content: "An error occurred while trying to retrieve the repository information.",
          ephemeral: true,
        });
      }
    }
  }
}
