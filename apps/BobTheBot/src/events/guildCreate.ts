import type { Guild } from "discord.js";
import type { Event } from "../utils/index.js";

export default class implements Event {
  public name = "guildCreate";

  public once = false;

  public async execute(guild: Guild) {
    await guild.members.me?.setNickname("Bob").catch(() => {});
  }
}
