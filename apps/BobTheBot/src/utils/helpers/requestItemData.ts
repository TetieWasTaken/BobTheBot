import fs from "node:fs";
import type { IItem } from "../index.js";

/**
 * @param id - The id of the item to get
 * @returns The item data, or undefined if not found
 */
export async function requestItemData(id: string): Promise<IItem | undefined> {
  const data = await new Promise<string>((resolve, reject) => {
    fs.readFile("./resources/items.json", "utf8", (error, data) => {
      if (error) reject(error);
      else resolve(data);
    });
  });

  const items = JSON.parse(data) as IItem[];
  return items.find((item: IItem) => item.id === id.toLowerCase().replaceAll(/\s+/g, ""));
}
