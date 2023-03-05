import { logger, type ExtendedClient } from "./index.js";
import type { Connection, Collection } from "mongoose";
import cron from "node-cron";

interface ICollection {
  queryFn: (doc: any) => boolean;
  label: string;
}

export function sweeperLoop(client: ExtendedClient, connection: Connection) {
  logger.info("Starting database sweep loop");
  cron.schedule(
    "0 12 * * 6",
    async () => {
      if (!client.isReady()) return logger.warn("Client is not ready, skipping sweep");
      await sweep(client, connection);
    },
    {
      scheduled: true,
      timezone: "Europe/London",
    }
  );
}

async function sweep(client: ExtendedClient, connection: Connection): Promise<void> {
  logger.info("Sweeping database");

  let info: string[][] = [["Collection", "Deleted"]];

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
    info.push([label, `${count} guilds`]);
  }

  logger.info({ table: info }, "Database sweep completed");
}
