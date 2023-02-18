require("dotenv").config();
const { REST, Routes, ActivityType } = require("discord.js");
const { logTimings } = require("../utils/logTimings");
const { table } = require("table");

module.exports = {
  name: "ready",
  once: true,
  async execute(client, commands) {
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

    await console.log(table(cnslTable, config), "\n————————————————————————————————————————————————\n");

    const timerStart = Date.now();

    const CLIENT_ID = client.user.id;

    const rest = new REST({
      version: "10",
    }).setToken(process.env.BOT_TOKEN);

    (async () => {
      try {
        if (process.env.ENV === "production") {
          await rest.put(Routes.applicationCommands(CLIENT_ID), {
            body: commands,
          });
        } else {
          await rest.put(Routes.applicationGuildCommands(CLIENT_ID, process.env.GUILD_ID), {
            body: commands,
          });
        }

        const registerConfig = {
          header: {
            alignment: "center",
            content: `Commands registered`,
          },
          columnDefault: {
            width: 20,
          },
        };

        const registerTable = [
          ["Commands", `${commands.length}`],
          ["Scope", `${process.env.ENV === "production" ? "Global" : "Guild"}`],
          process.env.ENV === "production"
            ? ["Servers", `${client.guilds.cache.size}`]
            : ["Guild", `${process.env.GUILD_ID}`],
        ];

        await console.log(table(registerTable, registerConfig));

        client.timings.set("Registering", Date.now() - timerStart);

        if (client.timings.size === 5) {
          logTimings(client.timings);
        }
      } catch (err) {
        if (err) console.log(err);
      }
    })();

    /*client.user.setPresence({
      activities: [{ name: `discord`, type: ActivityType.Watching }],
      status: "online",
    });*/
  },
};
