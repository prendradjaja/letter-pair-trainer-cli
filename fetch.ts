import { secrets } from "./SECRETS";
// import http = require("http");
import { get } from "request-promise-native";

const API_KEY = secrets.googleApiKey;
const RANGE = "Main!A2:AA25";
const SPREADSHEET_ID = secrets.letterPairsSheetId;
const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}?key=${API_KEY}`;

get(url).then(console.log);
