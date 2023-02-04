let Parser = require("expr-eval").Parser;
const { ChartJSNodeCanvas } = require("chartjs-node-canvas");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits } = require("discord.js");

const width = 800;
const height = 600;
const backgroundColour = "white";

const requiredBotPerms = {
  type: "flags",
  key: [],
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("graph")
    .setDescription("Creates a graph")
    .addStringOption((option) =>
      option
        .setName("expression")
        .setDescription("The expression to graph (ex: 2 * x + 1)")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("points")
        .setDescription("Amount of point iterations in the graph")
        .setRequired(false)
        .setMaxValue(1000)
    ),
  cooldownTime: 20 * 1000,
  async execute(interaction) {
    const expression = interaction.options.getString("expression");
    const pointAmount = interaction.options.getInteger("points") ?? 26;

    let parser = new Parser();
    let expr = parser.parse(`${expression}`);

    let yValue = [];
    let xValue = [];

    for (x = 0; x < pointAmount; x++) {
      yValue.push(expr.evaluate({ x: x }));
      xValue.push(x);
    }

    const canvas = new ChartJSNodeCanvas({
      width,
      height,
      backgroundColour,
    });

    const config = {
      type: "line",
      data: {
        labels: xValue,
        datasets: [
          {
            label: expression,
            backgroundColour: "rgba(0,0,0,1.0)",
            borderColor: "red",
            data: yValue,
          },
        ],
      },
      options: {},
      plugins: [],
    };

    const image = await canvas.renderToBuffer(config);

    await interaction.reply({ files: [image] });
  },
  requiredBotPerms: requiredBotPerms,
};
