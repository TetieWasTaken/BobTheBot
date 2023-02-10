const {
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require("discord.js");

module.exports = {
  editDictPage: async (interaction, result, currentPage, totalPages) => {
    await interaction.deferUpdate();

    if (currentPage !== 0) {
      if (currentPage < 1) {
        currentPage = totalPages - 1;
      } else if (currentPage >= totalPages) {
        currentPage = 0;
      }
    }

    if (result[0].meanings[0].definitions[currentPage].synonyms.length === 0) {
      result[0].meanings[0].definitions[currentPage].synonyms = "None";
    }
    if (result[0].meanings[0].definitions[currentPage].antonyms.length === 0) {
      result[0].meanings[0].definitions[currentPage].antonyms = "None";
    }
    if (result[0].meanings[0].definitions[currentPage].example === undefined) {
      result[0].meanings[0].definitions[currentPage].example = "None";
    }

    const embed = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle(result[0].word)
      .setURL(
        result[0].phonetics[0].audio.length > 0
          ? result[0].phonetics[0].audio
          : null
      )
      .setDescription(result[0].meanings[0].definitions[currentPage].definition)
      .addFields(
        {
          name: "Synonyms",
          value: result[0].meanings[0].definitions[currentPage].synonyms,
          inline: true,
        },
        {
          name: "Antonyms",
          value: result[0].meanings[0].definitions[currentPage].antonyms,
          inline: true,
        },
        {
          name: "Example",
          value: result[0].meanings[0].definitions[currentPage].example,
          inline: false,
        }
      )
      .setTimestamp()
      .setFooter({
        text: `Page ${currentPage + 1}/${totalPages}`,
      });
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("dictprevious")
        .setLabel("Previous")
        .setEmoji("◀️")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(false),
      new ButtonBuilder()
        .setCustomId("dictnext")
        .setLabel("Next")
        .setEmoji("▶️")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(false)
    );
    return interaction.editReply({ embeds: [embed], components: [row] });
  },
};
