import type { Guild } from "discord.js";

module.exports = {
  name: "guildCreate",
  once: false,

  /**
   * @param guild - The guild that the bot joined
   */
  async execute(guild: Guild) {
    await guild.members.me?.setNickname("Bob").catch(() => {});
  },
};
