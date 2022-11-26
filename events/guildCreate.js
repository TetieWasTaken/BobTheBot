module.exports = {
  name: "guildCreate",
  once: false,
  execute(guild) {
    guild.members.me.setNickname("Bob");
  },
};
