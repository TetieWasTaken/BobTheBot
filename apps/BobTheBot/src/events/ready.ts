import { setTimeout } from "node:timers/promises";
import { logger, type ExtendedClient, type Event } from "../utils/index.js";

export default class ReadyEvent implements Event {
  public name = "ready";

  public once = true;

  public async execute(client: ExtendedClient) {
    logger.info("Client is ready");
    // This Promise is required to make sure the WebSocket is fully ready before proceeding
    await setTimeout(1_000);

    const WSStatus: { [key: number]: string } = {
      0: "Ready",
      1: "Connecting",
      2: "Reconnecting",
      3: "Idle",
      4: "Nearly",
      5: "Disconnected",
      6: "Waiting for Guilds",
      7: "Identifying",
      8: "Resuming",
    };

    logger.debug(
      {
        WSStatus: WSStatus[client.ws.status],
        User: client.user?.tag,
        ID: client.user?.id,
        ping: `${client.ws.ping}ms`,
      },
      "Client status"
    );
  }
}
