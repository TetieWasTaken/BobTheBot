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

module.exports = {
  useItem: function (interaction, item, data) {
    switch (item.name) {
      case "Placeholder":
        return placeholder(interaction, item, data);
      default:
        break;
    }
  },
};
