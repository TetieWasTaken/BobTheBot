import process from "node:process";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { logger, sweeperLoop, type ExtendedClient } from "./utils/index.js";

dotenv.config();

/**
 * Database class to handle database connection to MongoDB using Mongoose
 */
export default class Database {
  public connection: any;

  public constructor() {
    this.connection = null;
  }

  /**
   * @param client - The client to pass to sweeperLoop
   * @example
   * ```
   * import Database from "./database.js";
   *
   * const db = new Database();
   * db.connect(client).catch((error) => { ... });
   * ```
   */
  public async connect(client: ExtendedClient) {
    if (!process.env.MONGO_DATABASETOKEN) {
      logger.error("No database token provided");
      return;
    }

    const timerStart = Date.now();

    mongoose.set("strictQuery", true);

    await mongoose
      .connect(process.env.MONGO_DATABASETOKEN)
      .then(async () => {
        logger.info(`Connected to database in ${Date.now() - timerStart}ms`);

        this.connection = mongoose.connection;

        sweeperLoop(client, this.connection);

        // Unable to get the states out of mongoose.connection, temporary hardcode.
        const states: Record<number, string> = {
          0: "disconnected",
          1: "connected",
          2: "connecting",
          3: "disconnecting",
          99: "uninitialized",
        };

        logger.debug(
          {
            state: states[this.connection.readyState],
            port: this.connection.port,
            host: this.connection.host,
            database: this.connection.name,
          },
          "Database connection info"
        );
      })
      .catch((error: Error) => {
        logger.error(`Error connecting to database: ${error.message}`);
      });
  }
}
