require("dotenv").config();
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const { ActivityType } = require("discord.js");

module.exports = {
  name: "ready",
  once: true,
  execute(client, commands) {
    console.log("✔️ Scorcher is ready!");

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
          console.log("✔️ Globally registered commands");
        } else {
          await rest.put(
            Routes.applicationGuildCommands(CLIENT_ID, process.env.GUILD_ID),
            {
              body: commands,
            }
          );
          console.log("✔️ Locally registered commands");
        }
      } catch (err) {
        if (err) console.log(err);
      }
    })();

    client.user.setPresence({
      activities: [{ name: `discord`, type: ActivityType.Watching }],
      status: "online",
    });
  },
};
