const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");

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
    ),
  async execute(interaction) {
    const user = interaction.options.getString("user").toLowerCase();

    let res;

    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
      case "user":
        res = await fetch(`https://api.github.com/users/${user}`).then((res) => res.json());

        if (res.message) {
          return interaction.reply({
            content: `Unable to find requested user: \`${user}\``,
            ephemeral: true,
          });
        }

        try {
          const embed = new EmbedBuilder()
            .setColor("0x5865F2")
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
        } catch (error) {
          console.log(error);
          return interaction.reply({
            content: "An error occurred while trying to retrieve the user information.",
            ephemeral: true,
          });
        }
      case "repository": {
        const repository = interaction.options.getString("repository");

        res = await fetch(`https://api.github.com/repos/${user}/${repository}`).then((res) => res.json());

        if (res.message) {
          return interaction.reply({
            content: "That repository does not exist.",
            ephemeral: true,
          });
        }

        try {
          const embed = new EmbedBuilder()
            .setColor("0x5865F2")
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
          console.log(error);
          return interaction.reply({
            content: "An error occurred while trying to retrieve the repository information.",
            ephemeral: true,
          });
        }
      }
    }
  },
  requiredBotPerms: requiredBotPerms,
  requiredUserPerms: requiredUserPerms,
};
