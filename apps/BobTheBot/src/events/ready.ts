import { Client, ActivityType } from "discord.js";
import dotenv from "dotenv";
import { logger } from "../utils/index.js";

dotenv.config();

module.exports = {
  name: "ready",
  once: true,
  async execute(client: Client): Promise<void> {
    logger.info("Client is ready");
    // This Promise is required to make sure the WebSocket is fully ready before proceeding
    await new Promise((resolve) => setTimeout(resolve, 50));

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

    try {
      client.user?.setPresence({
        activities: [{ name: `discord`, type: ActivityType.Watching }],
        status: "online",
      });

      logger.info("Presence set");
      logger.debug({ name: `discord`, type: `Watching`, status: `online` }, "Ready");
    } catch (error) {
      logger.error(error);
    }
  },
};
