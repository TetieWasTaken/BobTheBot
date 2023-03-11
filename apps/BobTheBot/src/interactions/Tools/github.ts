import { SlashCommandBuilder, EmbedBuilder, type ChatInputCommandInteraction } from "discord.js";
import { Color } from "../../constants.js";

type IGithubUser = {
  avatar_url: string;
  bio: string | null;
  blog: string;
  company: string | null;
  created_at: string;
  email: string | null;
  events_url: string;
  followers: number;
  followers_url: string;
  following: number;
  following_url: string;
  gists_url: string;
  gravatar_id: string;
  hireable: boolean | null;
  html_url: string;
  id: number;
  location: string | null;
  login: string;
  message: string;
  name: string | null;
  node_id: string;
  organizations_url: string;
  public_gists: number;
  public_repos: number;
  received_events_url: string;
  repos_url: string;
  site_admin: boolean;
  starred_url: string;
  subscriptions_url: string;
  twitter_username: string | null;
  type: string;
  updated_at: string;
  url: string;
};

type IGithubRepository = {
  archive_url: string;
  archived: boolean;
  assignees_url: string;
  blobs_url: string;
  branches_url: string;
  clone_url: string;
  collaborators_url: string;
  comments_url: string;
  compare_url: string;
  contents_url: string;
  contributors_url: string;
  created_at: string;
  default_branch: string;
  deployments_url: string;
  description: string | null;
  disabled: boolean;
  downloads_url: string;
  events_url: string;
  fork: boolean;
  forks: number;
  forks_count: number;
  forks_url: string;
  full_name: string;
  git_commits_url: string;
  git_refs_url: string;
  git_tags_url: string;
  git_url: string;
  has_downloads: boolean;
  has_issues: boolean;
  has_pages: boolean;
  has_projects: boolean;
  has_wiki: boolean;
  homepage: string | null;
  hooks_url: string;
  html_url: string;
  id: number;
  issue_comment_url: string;
  issue_events_url: string;
  issues_url: string;
  keys_url: string;
  labels_url: string;
  language: string | null;
  languages_url: string;
  license: {
    key: string;
    name: string;
    node_id: string;
    spdx_id: string;
    url: string;
  } | null;
  merges_url: string;
  message: string;
  milestones_url: string;
  mirror_url: string | null;
  name: string;
  network_count: number;
  node_id: string;
  notifications_url: string;
  open_issues: number;
  open_issues_count: number;
  owner: IGithubUser;
  private: boolean;
  pulls_url: string;
  pushed_at: string;
  releases_url: string;
  size: number;
  ssh_url: string;
  stargazers_count: number;
  stargazers_url: string;
  statuses_url: string;
  subscribers_count: number;
  subscribers_url: string;
  svn_url: string;
  tags_url: string;
  teams_url: string;
  temp_clone_token: string | null;
  trees_url: string;
  updated_at: string;
  url: string;
  watchers: number;
  watchers_count: number;
};

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
    .setName("github")
    .setDescription("Retrieve information about a repository or user on GitHub.")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("user")
        .setDescription("Retrieve information about a user on GitHub.")
        .addStringOption((option) =>
          option.setName("user").setDescription("The user you want to get information about.").setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("repository")
        .setDescription("Retrieve information about a repository on GitHub.")
        .addStringOption((option) =>
          option.setName("user").setDescription("The user or company who owns the repository.").setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("repository")
            .setDescription("The repository you want to get information about.")
            .setRequired(true)
        )
    )
    .setDMPermission(true),
  async execute(interaction: ChatInputCommandInteraction<"cached">) {
    const user = interaction.options.getString("user", true).toLowerCase();

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

          return await Promise.resolve(interaction.reply({ embeds: [embed], ephemeral: true }));
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
          return await Promise.resolve(interaction.reply({ embeds: [embed], ephemeral: true }));
        } catch {
          return interaction.reply({
            content: "An error occurred while trying to retrieve the repository information.",
            ephemeral: true,
          });
        }
      }

      default: {
        // eslint-disable-next-line no-useless-return
        return;
      }
    }
  },
  requiredBotPerms,
  requiredUserPerms,
};
