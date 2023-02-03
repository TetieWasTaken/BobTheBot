const fs = require("fs");

module.exports = {
  requestItemData: async (id) => {
    const data = JSON.parse(fs.readFileSync("./docs/items.json", "utf8"));
    const item = data.find((item) => item.id === id);
    return item;
  },
};
