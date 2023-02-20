const { Client, Collection } = require("discord.js");

export class ExtendedClient extends Client {
  constructor(options: any) {
    super(options);

    this.interactions = new Collection();
    this.buttons = new Collection();
    this.cooldowns = new Collection();
    this.timings = new Collection();
  }
}
