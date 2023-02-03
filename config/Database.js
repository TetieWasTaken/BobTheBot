const mongoose = require("mongoose");
require("dotenv").config();
const { logTimings } = require("../utils/logTimings");

class Database {
  constructor() {
    this.connection = null;
  }

  connect(client) {
    const timerStart = Date.now();

    mongoose
      .connect(process.env.MONGO_DATABASETOKEN, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(() => {
        console.log("✅ Connected to database!");
        client.timings.set("Mongoose", Date.now() - timerStart);
        if (client.timings.size === 6) {
          logTimings(client.timings);
        }
        this.connection = mongoose.connection;
      })
      .catch((err) => {
        console.error(err);
      });
  }
}

module.exports = Database;
