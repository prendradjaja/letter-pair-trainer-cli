import fs = require("fs");

const DB_DIR = "./db/";

function getTablePath(table: string): string {
  return DB_DIR + table;
}

export function readTable<T>(table: string): T[] {
  const lines = fs
    .readFileSync(getTablePath(table), { encoding: "utf-8" })
    .split("\n")
    .filter(x => !!x);
  return JSON.parse("[" + lines.join(",") + "]");
}

export function appendTable<T>(table: string, item: T) {
  const itemString = JSON.stringify(item);
  const newline = "\n";
  fs.appendFileSync(getTablePath(table), itemString + newline, {
    encoding: "utf-8",
  });
}
