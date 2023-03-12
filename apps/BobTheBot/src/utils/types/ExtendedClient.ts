import { Client, Collection } from "discord.js";

/**
 * Extended discord.js Client class
 */
export class ExtendedClient extends Client {
  public interactions: Collection<string, any>;

  public buttons: Collection<string, any>;

  public cooldowns: Collection<string, any>;

  public constructor(options: any) {
    super(options);

    this.interactions = new Collection();
    this.buttons = new Collection();
    this.cooldowns = new Collection();
  }
}
