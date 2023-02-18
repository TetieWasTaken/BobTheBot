const fs = require("fs");

module.exports = {
  requestItemData: async (id) => {
    const data = await JSON.parse(fs.readFileSync("./resources/items.json", "utf8"));
    return data.find((item) => item.id === id.toLowerCase().replace(/\s+/g, ""));
  },
};
