import { ALL_LETTER_PAIRS } from "./constants";
import { LetterPair, Image } from "./types";

export class Grid {
  private data: { [key: string]: string[] } = {};

  constructor(rawData: string[][]) {
    for (let row of rawData) {
      this.data[row[0]] = row;
    }
  }

  public get(letters: LetterPair): Image {
    let first: string, second: string;
    if (letters.length === 2) {
      first = letters.charAt(0);
      second = letters.charAt(1);
    } else if (letters.length === 1) {
      first = " ";
      second = letters.charAt(0);
    } else {
      console.log("Bad input to Grid.get");
    }
    const idx = "_ ABCDEFGHIJKLMNOPQRSTUVWX".indexOf(first);
    return this.data[second][idx] || null;
  }

  public getNonBlank(): { [key: string]: Image } {
    const result = {};
    for (let pair of ALL_LETTER_PAIRS) {
      const val = this.get(pair);
      if (val) {
        result[pair] = val;
      }
    }
    return result;
  }
}
