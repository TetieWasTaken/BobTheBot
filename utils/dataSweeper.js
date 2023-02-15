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

  const deleteDocs = async (collection, queryFn) => {
    let count = 0;
    for await (const doc of collection.find()) {
      if (queryFn(doc)) {
        await collection.deleteOne({ _id: doc._id });
        count++;
      }
    }
    return count;
  };

  const collections = {
    economymodels: { queryFn: (doc) => doc.NetWorth <= 0, label: "Economy" },
    levelmodels: {
      queryFn: (doc) => !client.guilds.cache.get(doc.GuildId),
      label: "Levels",
    },
    infractionsmodels: {
      queryFn: (doc) => !client.guilds.cache.get(doc.GuildId),
      label: "Infractions",
    },
    guildmodels: {
      queryFn: (doc) => !client.guilds.cache.get(doc.GuildId),
      label: "Guilds",
    },
  };

  for (const [name, { queryFn, label }] of Object.entries(collections)) {
    const collection = connection.collections[name];
    const count = await deleteDocs(collection, queryFn);
    cnslTable.push([label, `${count} guilds`]);
  }

  console.log(table(cnslTable, config));
};

module.exports = { loop };
