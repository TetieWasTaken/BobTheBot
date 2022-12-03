module.exports = {
  name: "guildCreate",
  once: false,
  async execute(guild) {
    guild.members.me.setNickname("Bob");
  },
};
