import type { ExtendedClient } from "./types/index.js";
import type { Connection, Collection } from "mongoose";
import { table, TableUserConfig } from "table";
import cron from "node-cron";

interface ICollection {
  queryFn: (doc: any) => boolean;
  label: string;
}

const loop = (client: ExtendedClient, connection: Connection) => {
  cron.schedule(
    "0 12 * * 6",
    () => {
      if (!client.isReady()) return console.log("Client not ready, skipping sweep");
      sweep(client, connection);
    },
    {
      scheduled: true,
      timezone: "Europe/London",
    }
  );
};

const sweep = async (client: ExtendedClient, connection: Connection): Promise<void> => {
  const config: TableUserConfig = {
    header: {
      alignment: "center",
      content: "Sweeping database",
    },
  };

  let cnslTable: (string | number)[][] = [["Collection", "Deleted"]];

  const deleteDocs = async (collection: Collection<any> | undefined, queryFn: any) => {
    if (!collection) return 0;
    let count = 0;
    for await (const doc of collection.find()) {
      if (queryFn(doc)) {
        await collection.deleteOne({ _id: doc._id });
        count++;
      }
    }
    return count;
  };

  const collections: Record<string, ICollection> = {
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
