import type { Collection } from "discord.js";
import { table, TableUserConfig } from "table";

export function logTimings(timings: Collection<String, number>) {
  timings = timings.sort((a: number, b: number) => b - a);
  let config: TableUserConfig = {
    header: {
      alignment: "center",
      content: `Timings - ${timings.reduce((a, b) => a + b, 0)}ms`,
    },
  };
  let cnslTable = [];
  let componentRow = [];
  let timeRow = [];
  for (const timing of timings) {
    componentRow.push(timing[0]);
    timeRow.push(`${timing[1]}ms`);
  }
  cnslTable.push(componentRow);
  cnslTable.push(timeRow);

  console.log(`————————————————————————————————————————————————\n`);

  console.log(table(cnslTable, config));

  console.log(`————————————————————————————————————————————————\n`);
}