import fs from "fs";

export function getCategories() {
  return fs
    .readdirSync("./dist/interactions")
    .filter((item: string) => !/(^|\/)\.[^/.]/g.test(item))
    .filter((item: string) => item !== "context-menu")
    .map((choice: string) => ({ name: choice, value: choice }));
}
