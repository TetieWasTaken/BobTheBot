import type { ExtendedClient } from "../utils/types/index.js";

const mongoose = require("mongoose");
require("dotenv").config();
const { logTimings } = require("../utils/logTimings");
const { table } = require("table");

class Database {
  connection: any;

  constructor() {
    this.connection = null;
  }

  connect(client: ExtendedClient) {
    const timerStart = Date.now();

    mongoose.set("strictQuery", true);

    mongoose
      .connect(process.env.MONGO_DATABASETOKEN, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(() => {
        client.timings.set("Mongoose", Date.now() - timerStart);
        if (client.timings.size === 4) {
          logTimings(client.timings);
        }
        this.connection = mongoose.connection;

        require("../utils/dataSweeper").loop(client);

        type States = {
          [key: number]: string;
        };

        // Unable to get the states out of mongoose.connection, temporary hardcode.
        const states: States = {
          0: "disconnected",
          1: "connected",
          2: "connecting",
          3: "disconnecting",
          99: "uninitialized",
        };

        const config = {
          header: {
            alignment: "center",
            content: `${this.connection._connectionOptions.driverInfo.name} v${this.connection._connectionOptions.driverInfo.version}`,
          },
        };

        const cnslTable = [
          ["State", `${states[this.connection.readyState]}`],
          ["Port", `${this.connection.port}`],
          ["Host", `${this.connection.host}`],
          ["Database", `${this.connection.name}`],
          ["Collections", `${Object.keys(this.connection.collections).length}`],
        ];

        console.log(table(cnslTable, config), "\n————————————————————————————————————————————————\n");
      })
      .catch((err: any) => {
        console.error(err);
      });
  }
}

module.exports = Database;
