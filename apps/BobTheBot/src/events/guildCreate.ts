import type { Guild } from "discord.js";

module.exports = {
  name: "guildCreate",
  once: false,
  async execute(guild: Guild) {
    await guild.members.me?.setNickname("Bob").catch(() => {});
  },
};
