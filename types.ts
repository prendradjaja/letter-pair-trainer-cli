export type Card = { letterPair: LetterPair; image: Image; id: UUID };

export type LetterPair = string;
export type Image = string;
export type LetterPairAndImage = string;

export type DolphinSRCombination = any;
export type UUID = string;
export type ISODate = string;
export type DolphinSRRating = "easy" | "good" | "hard" | "again";
export interface DolphinSRReview {
  master: UUID;
  combination: DolphinSRCombination;
  ts: Date;
  rating: DolphinSRRating;
}
export type DolphinSRReviewSerialized = Omit<DolphinSRReview, "ts"> & {
  ts: ISODate;
};

export interface DolphinSRMaster {
  id: UUID;
  combinations: DolphinSRCombination[];
  fields: string[];
}

export interface DolphinSRCard {
  master: UUID;
  combination: DolphinSRCombination;
  front: string[];
  back: string[];
}

export interface Dolphin {
  addMasters: (...masters: DolphinSRMaster[]) => void;
  addReviews: (...reviews: DolphinSRReview[]) => void;
  summary: () => {
    due: number;
    later: number;
    learning: number;
    overdue: number;
  };
  nextCard: () => DolphinSRCard;
}

export type UuidMapping = UuidMappingSerialized;
export interface UuidMappingSerialized {
  key: string;
  value: string;
}
