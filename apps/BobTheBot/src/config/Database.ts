import { logger, sweeperLoop, ExtendedClient } from "../utils/index.js";

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export default class Database {
  connection: any;

  constructor() {
    this.connection = null;
  }

  connect(client: ExtendedClient) {
    if (!process.env.MONGO_DATABASETOKEN) return logger.error("No database token provided");

    const timerStart = Date.now();

    mongoose.set("strictQuery", true);

    mongoose
      .connect(process.env.MONGO_DATABASETOKEN)
      .then(() => {
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
      .catch((err: Error) => {
        logger.error(`Error connecting to database: ${err.message}`);
      });
  }
}
