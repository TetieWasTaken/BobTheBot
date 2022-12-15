const EconomySchema = require("../models/EconomyModel");

function placeholder(interaction, item, data) {
  const reward = Math.floor(Math.random() * 1000) + 1;

  data.Inventory.splice(data.Inventory.indexOf(item), 1);
  data.Wallet += reward;
  data.save();

  return interaction.reply({
    content: `You used \`${item.name}\` and received \`₳${reward}\` bobbucks`,
    ephemeral: true,
  });
}

function chicken(interaction, item, data) {
  switch (item.name) {
    case "Chicken":
      data.Multiplier = 1.2;
      data.Inventory.splice(data.Inventory.indexOf(item), 1);
      data.save();
      break;
    case "Super Chicken":
      data.Multiplier = 2;
      data.Inventory.splice(data.Inventory.indexOf(item), 1);
      data.save();
      break;
    case "Ultra Chicken":
      data.Multiplier = 2.5;
      data.Inventory.splice(data.Inventory.indexOf(item), 1);
      data.save();
      break;
    case "Mega Chicken":
      data.Multiplier = 3;
      data.Inventory.splice(data.Inventory.indexOf(item), 1);
      data.save();
      break;
    case "Giga Chicken":
      data.Multiplier = 3.5;
      data.Inventory.splice(data.Inventory.indexOf(item), 1);
      data.save();
      break;
  }

  return interaction.reply({
    content: `You equipped \`${item.name}\` and received a multiplier of \`${data.Multiplier}\``,
    ephemeral: true,
  });
}

module.exports = {
  useItem: function (interaction, item, data) {
    switch (item.name) {
      case "Placeholder":
        return placeholder(interaction, item, data);
      case "Chicken":
        return chicken(interaction, item, data);
      default:
        return interaction.reply({
          content: `You cannot use item: ${item.name}`,
          ephemeral: true,
        });
    }
  },
};
