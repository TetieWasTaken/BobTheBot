require("dotenv").config();
const { ActivityType } = require("discord.js");
const { table } = require("table");

module.exports = {
  name: "ready",
  once: true,
  async execute(client) {
    // This Promise is required to make sure the WebSocket is fully ready before proceeding
    await new Promise((resolve) => setTimeout(resolve, 50));

    const config = {
      header: {
        alignment: "center",
        content: "Client is ready!",
      },
    };

    const WSStatus = {
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
      ["Logged in as", `${client.user.tag}`],
      ["ID", `${client.user.id}`],
      ["Ping", `${await client.ws.ping}ms`],
    ];

    console.log(table(cnslTable, config), "\n————————————————————————————————————————————————\n");

    client.user.setPresence({
      activities: [{ name: `discord`, type: ActivityType.Watching }],
      status: "online",
    });
  },
};
