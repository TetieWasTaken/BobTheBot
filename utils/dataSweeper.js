const cron = require("node-cron");
const { table } = require("table");
const mongoose = require("mongoose");

const loop = (client) => {
  cron.schedule(
    "0 12 * * 6",
    () => {
      if (!client.isReady())
        return console.log("Client not ready, skipping sweep");
      sweep(client);
    },
    {
      scheduled: true,
      timezone: "Europe/London",
    }
  );
};

const sweep = async (client) => {
  const connection = mongoose.connection;

  const config = {
    header: {
      alignment: "center",
      content: "Sweeping database",
    },
  };

  let cnslTable = [["Collection", "Deleted"]];
  let count;

  for (const [name, collection] of Object.entries(connection.collections)) {
    switch (name) {
      case "economymodels":
        count = 0;
        for await (const doc of collection.find()) {
          if (doc.NetWorth <= 0) {
            await collection.deleteOne({ UserId: doc.UserId });
            count++;
          }
        }
        cnslTable.push(["Economy", `${count} guilds`]);
        break;
      case "levelmodels":
        count = 0;
        for await (const doc of collection.find()) {
          const guild = await client.guilds.cache.get(doc.GuildId);
          if (!guild) {
            await collection.deleteOne({ GuildId: doc.GuildId });
            count++;
          }
        }
        cnslTable.push(["Levels", `${count} guilds`]);
        break;
      case "infractionsmodels":
        count = 0;
        for await (const doc of collection.find()) {
          const guild = await client.guilds.cache.get(doc.GuildId);
          if (!guild) {
            await collection.deleteOne({ GuildId: doc.GuildId });
            count++;
          }
        }
        cnslTable.push(["Infractions", `${count} guilds`]);
        break;
      case "guildmodels":
        count = 0;
        for await (const doc of collection.find()) {
          const guild = await client.guilds.cache.get(doc.GuildId);
          if (!guild) {
            await collection.deleteOne({ GuildId: doc.GuildId });
            count++;
          }
        }
        cnslTable.push(["Guilds", `${count} guilds`]);
        break;
      default:
        break;
    }
  }

  console.log(table(cnslTable, config));
};

module.exports = { loop };
