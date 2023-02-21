import { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ButtonInteraction } from "discord.js";

interface IResult {
  word: string;
  phonetics: {
    text: string;
    audio: string;
  }[];
  meanings: {
    partOfSpeech: string;
    definitions: {
      definition: string;
      synonyms: string[] | string;
      antonyms: string[] | string;
      example: string | undefined;
    }[];
  }[];
}

interface IEditDictPageProps {
  interaction: ButtonInteraction;
  result: IResult[];
  currentPage: number;
  totalPages: number;
}

export async function editDictPage({ interaction, result, currentPage, totalPages }: IEditDictPageProps) {
  await interaction.deferUpdate();

  if (!result[0]) return interaction.editReply("No results found");

  if (currentPage !== 0) {
    if (currentPage < 1) {
      currentPage = totalPages - 1;
    } else if (currentPage >= totalPages) {
      currentPage = 0;
    }
  }

  const currentDefinition = result[0]?.meanings[0]?.definitions[currentPage];

  if (!currentDefinition) return interaction.editReply("No results found");

  if (currentDefinition.synonyms.length === 0) {
    currentDefinition.synonyms = "None";
  }

  if (currentDefinition.antonyms.length === 0) {
    currentDefinition.antonyms = "None";
  }

  if (currentDefinition.example === undefined) {
    currentDefinition.example = "None";
  }

  const firstPhonetic = result[0]?.phonetics[0];
  const audioUrl = firstPhonetic?.audio ?? null;

  const embed = new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle(result[0].word)
    .setURL(audioUrl)
    .setDescription(currentDefinition.definition)
    .addFields(
      {
        name: "Synonyms",
        value: `${currentDefinition.synonyms}`,
        inline: true,
      },
      {
        name: "Antonyms",
        value: `${currentDefinition.antonyms}`,
        inline: true,
      },
      {
        name: "Example",
        value: `${currentDefinition.example}`,
        inline: false,
      }
    )
    .setTimestamp()
    .setFooter({
      text: `Page ${currentPage + 1}/${totalPages}`,
    });
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
}
