import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
} from "discord.js";

const requiredBotPerms = {
  type: "flags" as const,
  key: [] as const,
};

const requiredUserPerms = {
  type: "flags" as const,
  key: [] as const,
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("dictionary")
    .setDescription("Search for a word in the dictionary")
    .addStringOption((option) => option.setName("word").setDescription("Word to search for").setRequired(true)),
  async execute(interaction: ChatInputCommandInteraction<"cached">) {
    const input = interaction.options.getString("word", true);
    const regex = /^[a-zA-Z]+$/;

    if (!input.match(regex)) {
      return interaction.reply({
        content: "Please enter a valid word",
        ephemeral: true,
      });
    }

    await interaction.deferReply();

    const result = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${input}`).then((res) => res.json());

    const totalPages = result[0].meanings[0].definitions.length;

    module.exports.result = result;
    module.exports.totalPages = totalPages;

    if (result.status === 404 || result.title === "No Definitions Found") {
      return interaction.editReply({
        content: "Word not found",
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

    // Warning: Synonyms and antonyms are not working properly

    const embed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle(result[0].word)
      .setURL(result[0].phonetics[0].audio.length > 0 ? result[0].phonetics[0].audio : null)
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
      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
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
  requiredBotPerms: requiredBotPerms,
  requiredUserPerms: requiredUserPerms,
};
