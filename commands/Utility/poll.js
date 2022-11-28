const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("poll")
    .setDescription("Start a poll")
    .addStringOption((option) =>
      option
        .setName("message")
        .setDescription("message to display on the poll")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("option1")
        .setDescription("Add a poll option (min 2 max 10)")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("option2")
        .setDescription("Add a poll option (min 2 max 10)")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("option3")
        .setDescription("Add a poll option (min 2 max 10)")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("option4")
        .setDescription("Add a poll option (min 2 max 10)")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("option5")
        .setDescription("Add a poll option (min 2 max 10)")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("option6")
        .setDescription("Add a poll option (min 2 max 10)")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("option7")
        .setDescription("Add a poll option (min 2 max 10)")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("option8")
        .setDescription("Add a poll option (min 2 max 10)")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("option9")
        .setDescription("Add a poll option (min 2 max 10)")
        .setRequired(false)
    ),
  async execute(interaction) {
    const message = interaction.options.getString("message");
    const option1 = interaction.options.getString("option1");
    const option2 = interaction.options.getString("option2");
    const option3 = interaction.options.getString("option3");
    const option4 = interaction.options.getString("option4");
    const option5 = interaction.options.getString("option5");
    const option6 = interaction.options.getString("option6");
    const option7 = interaction.options.getString("option7");
    const option8 = interaction.options.getString("option8");
    const option9 = interaction.options.getString("option9");
    const options = [
      option1,
      option2,
      option3,
      option4,
      option5,
      option6,
      option7,
      option8,
      option9,
    ];
    const optionsFiltered = options.filter((option) => option !== null);
    console.log(optionsFiltered);

    let roleColor = "ffffff";
    const member = interaction.guild.members.cache.get(
      interaction.client.user.id
    );
    const roleCacheSize = member.roles.cache.size;
    if (roleCacheSize >= 2) {
      if (member.roles.color !== null) {
        roleColor = member.roles.color.hexColor;
      }
    }

    const pollEmbed = new EmbedBuilder()
      .setColor(roleColor)
      .setTitle(`${message}`)
      .addFields({
        name: `Option 1`,
        value: `${option1} :one:`,
        inline: true,
      })
      .addFields({
        name: `Option 2`,
        value: `${option2} :two:`,
        inline: true,
      })
      .addFields({
        name: `Option 3`,
        value: `${option3} :three:`,
        inline: true,
      })
      .addFields({
        name: `Option 4`,
        value: `${option4} :four:`,
        inline: true,
      })
      .addFields({
        name: `Option 5`,
        value: `${option5} :five:`,
        inline: true,
      })
      .addFields({
        name: `Option 6`,
        value: `${option6} :six:`,
        inline: true,
      })
      .addFields({
        name: `Option 7`,
        value: `${option7} :seven:`,
        inline: true,
      })
      .addFields({
        name: `Option 8`,
        value: `${option8} :eight:`,
        inline: true,
      })
      .addFields({
        name: `Option 9`,
        value: `${option9} :nine:`,
        inline: true,
      })
      .setTimestamp();

    for (let i = 9; i > optionsFiltered.length; i--) {
      pollEmbed.spliceFields(-1, 1);
    }

    const reactions = [
      "",
      "1️⃣",
      "2️⃣",
      "3️⃣",
      "4️⃣",
      "5️⃣",
      "6️⃣",
      "7️⃣",
      "8️⃣",
      "9️⃣",
    ];

    const interactionMessage = await interaction.reply({
      embeds: [pollEmbed],
      fetchReply: true,
    });
    for (let i = 1; i <= optionsFiltered.length; i++) {
      interactionMessage.react(reactions[i]);
    }
  },
};
