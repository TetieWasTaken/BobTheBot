import { Client, Collection } from "discord.js";

export class ExtendedClient extends Client {
  public interactions: Collection<string, any>;
  public buttons: Collection<string, any>;
  public cooldowns: Collection<string, any>;
  public timings: Collection<string, any>;

  constructor(options: any) {
    super(options);

    this.interactions = new Collection();
    this.buttons = new Collection();
    this.cooldowns = new Collection();
    this.timings = new Collection();
  }
}
