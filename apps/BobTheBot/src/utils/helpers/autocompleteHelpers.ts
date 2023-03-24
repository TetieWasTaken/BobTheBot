import fs from "node:fs";
import { fileURLToPath, URL } from "node:url";
import readdirp from "readdirp";
import { capitalizeFirst } from "../index.js";

/**
 * @returns Categories in an array of objects
 */
export function getCategories() {
  return fs
    .readdirSync("./dist/interactions")
    .filter((item: string) => !/(?:^|\/)\.[^./]/g.test(item))
    .filter((item: string) => item !== "context-menu")
    .map((choice: string) => ({ name: choice, value: choice }));
}

/**
 * @returns A list of all the commands in an array formatted for the autocomplete interaction
 * @example
 * ```
 * const commands = await getCommands();
 * console.log(commands); // ["Information: Avatar", "Information: Botinfo", etc..]
 * ```
 */
export async function getCommands() {
  const entries: string[] = [];

  for await (const dir of readdirp(fileURLToPath(new URL(`${/.*\/dist/.exec(import.meta.url)}/interactions/`)), {
    fileFilter: ["*.js"],
  })) {
    const parent = /(?<=\/)[^/]+(?=\/[^/]+$)/.exec(dir.fullPath)?.toString();
    const basename = dir.basename.split(".")[0];
    if (!parent || !basename) continue;

    entries.push(`${capitalizeFirst(parent)}: ${capitalizeFirst(basename)}`);
  }

  return entries;
}
