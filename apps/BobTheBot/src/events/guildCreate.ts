module.exports = {
  name: "guildCreate",
  once: false,
  async execute(guild: any) {
    guild.members.me.setNickname("Bob");
  },
};
