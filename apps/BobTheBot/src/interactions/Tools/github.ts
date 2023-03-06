import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from "discord.js";
import { Color } from "../../constants.js";

interface IGithubUser {
  message: string;
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  site_admin: boolean;
  name: string | null;
  company: string | null;
  blog: string;
  location: string | null;
  email: string | null;
  hireable: boolean | null;
  bio: string | null;
  twitter_username: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

interface IGithubRepository {
  message: string;
  id: number;
  node_id: string;
  name: string;
  full_name: string;
  private: boolean;
  owner: IGithubUser;
  html_url: string;
  description: string | null;
  fork: boolean;
  url: string;
  forks_url: string;
  keys_url: string;
  collaborators_url: string;
  teams_url: string;
  hooks_url: string;
  issue_events_url: string;
  events_url: string;
  assignees_url: string;
  branches_url: string;
  tags_url: string;
  blobs_url: string;
  git_tags_url: string;
  git_refs_url: string;
  trees_url: string;
  statuses_url: string;
  languages_url: string;
  stargazers_url: string;
  contributors_url: string;
  subscribers_url: string;
  subscription_url: string;
  commits_url: string;
  git_commits_url: string;
  comments_url: string;
  issue_comment_url: string;
  contents_url: string;
  compare_url: string;
  merges_url: string;
  archive_url: string;
  downloads_url: string;
  issues_url: string;
  pulls_url: string;
  milestones_url: string;
  notifications_url: string;
  labels_url: string;
  releases_url: string;
  deployments_url: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  git_url: string;
  ssh_url: string;
  clone_url: string;
  svn_url: string;
  homepage: string | null;
  size: number;
  stargazers_count: number;
  watchers_count: number;
  language: string | null;
  has_issues: boolean;
  has_projects: boolean;
  has_downloads: boolean;
  has_wiki: boolean;
  has_pages: boolean;
  forks_count: number;
  mirror_url: string | null;
  archived: boolean;
  disabled: boolean;
  open_issues_count: number;
  license: {
    key: string;
    name: string;
    spdx_id: string;
    url: string;
    node_id: string;
  } | null;
  allow_forking: boolean;
  forks: number;
  open_issues: number;
  watchers: number;
  default_branch: string;
  temp_clone_token: string | null;
  network_count: number;
  subscribers_count: number;
}

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
      case "user":
        const res: IGithubUser = await fetch(`https://api.github.com/users/${user}`).then((res) => res.json());

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

          return interaction.reply({ embeds: [embed], ephemeral: true });
        } catch (err) {
          return interaction.reply({
            content: "An error occurred while trying to retrieve the user information.",
            ephemeral: true,
          });
        }
      case "repository": {
        const repository = interaction.options.getString("repository");

        const res: IGithubRepository = await fetch(`https://api.github.com/repos/${user}/${repository}`).then((res) =>
          res.json()
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
          return interaction.reply({ embeds: [embed], ephemeral: true });
        } catch (error) {
          return interaction.reply({
            content: "An error occurred while trying to retrieve the repository information.",
            ephemeral: true,
          });
        }
      }
      default: {
        return;
      }
    }
  },
  requiredBotPerms: requiredBotPerms,
  requiredUserPerms: requiredUserPerms,
};
