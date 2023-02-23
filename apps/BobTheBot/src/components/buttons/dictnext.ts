import type { ButtonInteraction } from "discord.js";

import dictdata from "../../interactions/Tools/dictionary.js";
import { editDictPage, IResult } from "../../utils/index.js";

module.exports = {
  data: {
    name: "dictnext",
  },
  async execute(interaction: ButtonInteraction) {
    if (!interaction.message?.embeds[0]?.data?.footer) return;

    let footer = interaction.message.embeds[0].data.footer.text.match(/(\d+)/);
    let currentPage;
    if (footer) {
      currentPage = parseInt(footer[0]);
    } else {
      currentPage = 1;
    }
    const totalPages: number = dictdata.totalPages;
    const result: IResult[] = dictdata.result;

    await editDictPage({ interaction: interaction, result: result, currentPage: currentPage, totalPages: totalPages });
  },
};
