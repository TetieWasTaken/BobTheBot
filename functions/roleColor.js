module.exports = {
  roleColor: function (interaction) {
    let roleColor = "ffffff";
    const botMember = interaction.guild.members.cache.get(
      interaction.client.user.id
    );
    const roleCacheSize = botMember.roles.cache.size;
    if (roleCacheSize >= 2) {
      if (botMember.roles.color !== null) {
        roleColor = botMember.roles.color.hexColor;
      }
    }

    return roleColor;
  },
};
