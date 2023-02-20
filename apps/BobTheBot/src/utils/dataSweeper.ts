import type { Client } from "discord.js";
import type { Collection } from "mongoose";

const cron = require("node-cron");
const { table } = require("table");
const mongoose = require("mongoose");

const loop = (client: Client) => {
  cron.schedule(
    "0 12 * * 6",
    () => {
      if (!client.isReady()) return console.log("Client not ready, skipping sweep");
      sweep(client);
    },
    {
      scheduled: true,
      timezone: "Europe/London",
    }
  );
};

const sweep = async (client: Client) => {
  const connection = mongoose.connection;

  const config = {
    header: {
      alignment: "center",
      content: "Sweeping database",
    },
  };

  let cnslTable = [["Collection", "Deleted"]];

  const deleteDocs = async (collection: Collection, queryFn: any) => {
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
    economymodels: { queryFn: (doc: any) => doc.NetWorth <= 0, label: "Economy" },
    levelmodels: {
      queryFn: (doc: any) => !client.guilds.cache.get(doc.GuildId),
      label: "Levels",
    },
    infractionsmodels: {
      queryFn: (doc: any) => !client.guilds.cache.get(doc.GuildId),
      label: "Infractions",
    },
    guildmodels: {
      queryFn: (doc: any) => !client.guilds.cache.get(doc.GuildId),
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
