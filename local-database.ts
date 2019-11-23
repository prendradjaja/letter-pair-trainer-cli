import fs = require("fs");
import {
  UuidMappingSerialized,
  DolphinSRReviewSerialized,
  UUID,
  LetterPairAndImage,
  DolphinSRReview,
} from "./types";
import { parseISO } from "date-fns";

// High level: Table-specific functions with serializers/deserializers
export function readUuids(): { [key: string]: UUID } {
  const result = {};
  readUuidsRaw().forEach(uuidMapping => {
    result[uuidMapping.key] = uuidMapping.value;
  });
  return result;
}
export function storeUuid(key: LetterPairAndImage, uuid: UUID) {
  appendUuidRaw({
    key: key,
    value: uuid,
  });
}

export function readReviews(): DolphinSRReview[] {
  return readReviewsRaw().map(review => ({
    ...review,
    ts: parseISO(review.ts),
  }));
}
export function storeReview(review: DolphinSRReview) {
  appendReviewRaw({
    ...review,
    ts: review.ts.toISOString(),
  });
}

// Second lowest level: Table-specific functions
const UUIDS = "uuids";
const readUuidsRaw = () => readTable<UuidMappingSerialized>(UUIDS);
const appendUuidRaw = (uuidMapping: UuidMappingSerialized) =>
  appendTable<UuidMappingSerialized>(UUIDS, uuidMapping);

const REVIEWS = "reviews";
const readReviewsRaw = () => readTable<DolphinSRReviewSerialized>(REVIEWS);
const appendReviewRaw = (review: DolphinSRReviewSerialized) =>
  appendTable<DolphinSRReviewSerialized>(REVIEWS, review);

// Lowest level: Table-agnostic DB functions
const DB_DIR = "./db/";

function getTablePath(table: string): string {
  return DB_DIR + table;
}

function readTable<T>(table: string): T[] {
  const lines = fs
    .readFileSync(getTablePath(table), { encoding: "utf-8" })
    .split("\n")
    .filter(x => !!x);
  return JSON.parse("[" + lines.join(",") + "]");
}

function appendTable<T>(table: string, item: T) {
  const itemString = JSON.stringify(item);
  const newline = "\n";
  fs.appendFileSync(getTablePath(table), itemString + newline, {
    encoding: "utf-8",
  });
}
