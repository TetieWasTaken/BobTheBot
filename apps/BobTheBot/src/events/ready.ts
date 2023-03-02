import { Client, ActivityType } from "discord.js";
import dotenv from "dotenv";
import { table, TableUserConfig } from "table";

dotenv.config();

module.exports = {
  name: "ready",
  once: true,
  async execute(client: Client): Promise<void> {
    // This Promise is required to make sure the WebSocket is fully ready before proceeding
    await new Promise((resolve) => setTimeout(resolve, 50));

    const config: TableUserConfig = {
      header: {
        alignment: "center",
        content: "Client is ready!",
      },
    };

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

    const cnslTable = [
      ["WS Status", `${WSStatus[client.ws.status]}`],
      ["Logged in as", `${client.user?.tag}`],
      ["ID", `${client.user?.id}`],
      ["Ping", `${client.ws.ping}ms`],
    ];

    console.log(table(cnslTable, config), "\n————————————————————————————————————————————————\n");

    try {
      client.user?.setPresence({
        activities: [{ name: `discord`, type: ActivityType.Watching }],
        status: "online",
      });
    } catch (error) {
      console.error(error);
    }
  },
};
