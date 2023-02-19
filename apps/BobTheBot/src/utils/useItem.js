const itemHandlers = {
  placeholder: (interaction, item, data) => {
    const reward = Math.floor(Math.random() * 1000) + 1;

    data.Inventory[item.name] -= 1;
    data.Wallet += reward;
    data.NetWorth += reward;

    return interaction.reply({
      content: `You used \`${item.name}\` and received \`₳${reward}\` bobbucks`,
      ephemeral: true,
    });
  },
  chicken: (interaction, item, data) => {
    switch (item.name) {
      case "Chicken":
        data.Multiplier = 1.2;
        break;
      case "Super Chicken":
        data.Multiplier = 2;
        break;
      case "Ultra Chicken":
        data.Multiplier = 2.5;
        break;
      case "Mega Chicken":
        data.Multiplier = 3;
        break;
      case "Giga Chicken":
        data.Multiplier = 3.5;
        break;
    }

    data.Inventory[item.name] -= 1;

    return interaction.reply({
      content: `You equipped \`${item.name}\` and received a multiplier of \`${data.Multiplier}\``,
      ephemeral: true,
    });
  },
};

module.exports = {
  useItem: function (interaction, item, data) {
    const handler = itemHandlers[item.name.toLowerCase()];
    if (handler) {
      return handler(interaction, item, data);
    } else {
      return interaction.reply({
        content: `You cannot use item: ${item.name}`,
        ephemeral: true,
      });
    }
  },
};
//
