import fs from "fs";
import type { IItem } from "./index.js";

export async function requestItemData(id: string): Promise<IItem | undefined> {
  const data = (await JSON.parse(fs.readFileSync("./resources/items.json", "utf8"))) as IItem[];
  return data.find((item: IItem) => item.id === id.toLowerCase().replace(/\s+/g, ""));
}
