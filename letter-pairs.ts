import { secrets } from "./SECRETS";
import { get } from "request-promise-native";
import { Grid } from "./grid";
import { LetterPair, LetterPairAndImage, Image } from "./types";

export function getGrid(): Promise<Grid> {
  const API_KEY = secrets.googleApiKey;
  const RANGE = "Main!A2:AA25";
  const SPREADSHEET_ID = secrets.letterPairsSheetId;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}?key=${API_KEY}`;
  return get(url).then(res => new Grid(JSON.parse(res).values));
}

export function makeKey(lp: LetterPair, img: Image): LetterPairAndImage {
  return lp + "|" + img;
}
