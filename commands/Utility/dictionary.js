const { SlashCommandBuilder } = require("@discordjs/builders");
const {
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

const requiredPerms = {
  type: "flags",
  key: [PermissionFlagsBits.SendMessages],
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("dictionary")
    .setDescription("Search for a word in the dictionary")
    .addStringOption((option) =>
      option
        .setName("word")
        .setDescription("Word to search for")
        .setRequired(true)
    ),
  async execute(interaction) {
    const input = interaction.options.getString("word");
    const regex = /^[a-zA-Z]+$/;

    if (!input.match(regex)) {
      return interaction.reply({
        content: "Please enter a valid word",
        ephemeral: true,
      });
    }

    await interaction.deferReply();

    const result = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${input}`
    ).then((res) => res.json());

    const totalPages = result[0].meanings[0].definitions.length;

    module.exports.result = result;
    module.exports.totalPages = totalPages;

    if (result.status === 404 || result.title === "No Definitions Found") {
      return interaction.reply({
        content: "Word not found",
        ephemeral: true,
      });
    }

    if (result[0].meanings[0].definitions[0].synonyms.length === 0) {
      result[0].meanings[0].definitions[0].synonyms = "None";
    }
    if (result[0].meanings[0].definitions[0].antonyms.length === 0) {
      result[0].meanings[0].definitions[0].antonyms = "None";
    }
    if (result[0].meanings[0].definitions[0].example === undefined) {
      result[0].meanings[0].definitions[0].example = "None";
    }

    /*The data is a list with one element, which is a dictionary.
The dictionary has the following keys:
"word": The word being defined. In this case, the word is "hello".
"phonetics": A list of dictionaries representing the different phonetic pronunciations of the word "hello". Each dictionary has the following keys:
"audio": The URL of an audio file with the pronunciation of the word.
"sourceUrl": The URL of the source of the pronunciation.
"license": A dictionary with information about the license for the pronunciation.
"meanings": A list of dictionaries representing the different meanings of the word "hello". Each dictionary has the following keys:
"partOfSpeech": The part of speech (noun, verb, interjection, etc.) of the meaning.
"definitions": A list of dictionaries representing the different definitions of the word "hello" for this part of speech. Each dictionary has the following keys:
"definition": The definition of the word.
"synonyms": A list of synonyms (words with the same or similar meaning) for the word.
"antonyms": A list of antonyms (words with opposite meanings) for the word.
"example": An example sentence using the word.
"synonyms": A list of synonyms for the word for this part of speech.
"antonyms": A list of antonyms for the word for this part of speech.
"license": A dictionary with information about the license for the word's definition and information.
"sourceUrls": A list of URLs where the word's definition and information can be found.
*/

    const embed = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle(result[0].word)
      .setURL(result[0].phonetics[0].audio)
      .setDescription(result[0].meanings[0].definitions[0].definition)
      .addFields(
        {
          name: "Part of Speech",
          value: `${result[0].meanings[0].partOfSpeech}`,
          inline: true,
        },
        {
          name: "Synonyms",
          value: `${result[0].meanings[0].definitions[0].synonyms ?? "None"}`,
          inline: true,
        },
        {
          name: "Antonyms",
          value: `${result[0].meanings[0].definitions[0].antonyms ?? "None"}`,
          inline: true,
        },
        {
          name: "Example",
          value: `${result[0].meanings[0].definitions[0].example ?? "None"}`,
          inline: false,
        }
      )
      .setTimestamp()
      .setFooter({
        text: `Page 1/${result[0].meanings[0].definitions.length}`,
      });

    if (result[0].meanings[0].definitions.length !== 1) {
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
    } else {
      return interaction.editReply({ embeds: [embed] });
    }
  },
  requiredPerms: requiredPerms,
};
