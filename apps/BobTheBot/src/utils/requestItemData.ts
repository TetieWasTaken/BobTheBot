import fs from "fs";

export interface IItem {
  id: string;
  name: string;
  description: string;
  note: string | undefined;
  type: string;
  sellable: boolean;
  buyable: boolean;
  price: number | undefined;
  usable: boolean;
  usage: string;
}

export async function requestItemData(id: string): Promise<IItem | undefined> {
  const data = (await JSON.parse(fs.readFileSync("./resources/items.json", "utf8"))) as IItem[];
  return data.find((item: IItem) => item.id === id.toLowerCase().replace(/\s+/g, ""));
}
