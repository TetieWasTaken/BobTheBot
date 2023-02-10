module.exports = {
  roleColor: (interaction) => {
    let roleColor = "ffffff";
    const botMember = interaction.guild.members.me;

    if (botMember.roles.cache.size >= 2 && botMember.roles.color !== null) {
      roleColor = botMember.roles.color.hexColor;
    }

    return roleColor;
  },
};
