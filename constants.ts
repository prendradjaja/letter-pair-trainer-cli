import { LetterPair, DolphinSRRating } from "./types";

export const CORNER_LETTERS = Array.from("BCDFGHIJKLMNOPQSTUVWX"); // no A, E, R
export const ALL_LETTER_PAIRS: LetterPair[] = (() => {
  const result = [];
  for (let letter of CORNER_LETTERS) {
    result.push(letter);
  }
  for (let first of CORNER_LETTERS) {
    for (let second of CORNER_LETTERS) {
      if (first !== second) {
        result.push(first + second);
      }
    }
  }
  return result;
})();

export const RATINGS: DolphinSRRating[] = ["easy", "good", "hard", "again"];
