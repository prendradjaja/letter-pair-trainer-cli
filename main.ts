import {
  readUuids,
  storeUuid,
  readReviews,
  storeReview,
} from "./local-database";
import { getGrid, makeKey } from "./letter-pairs";
import { DolphinSR, generateId } from "dolphinsr";
import {
  LetterPair,
  UUID,
  Image,
  DolphinSRMaster,
  Dolphin,
  Card,
  DolphinSRRating,
  DolphinSRReview,
  DolphinSRCard,
} from "./types";
import { RATINGS } from "./constants";

const prompt = require("prompt-sync")({ sigint: true }); // can i use import syntax?

function randomChoice<T>(choices: T[]): T {
  var index = Math.floor(Math.random() * choices.length);
  return choices[index];
}

async function main() {
  console.log("Loading...");
  const app = new App();
  await app.init();
  // sync prompt? prompt sync?

  console.log();
  while (app.card) {
    const { front, back } = app.card;
    prompt(`${app.sessionStats.total + 1}. ${front}? (enter to continue) `);
    console.log(back);
    const rating = promptForRating();
    const review = {
      master: app.card.dolphinCard.master,
      combination: app.card.dolphinCard.combination,
      ts: new Date(),
      rating: rating,
    };
    storeReview(review);
    app.dolphin.addReviews(review);
    app.sessionStats.total++;
    const newCard = app.dolphin.nextCard();
    if (newCard) {
      const front = newCard.front[0];
      const back = newCard.back[0];
      app.card = { front, back, flipped: false, dolphinCard: newCard };
    } else {
      console.log("No more cards! Exiting.");
      return;
    }
    console.clear();
  }

  console.log("No more cards.");
}

function promptForRating(): DolphinSRRating {
  console.log("Rating? 1-easy / 2-good / 3-hard / 4-again");
  let response;
  while (!parseRating(response)) {
    response = prompt("> ");
  }
  return parseRating(response);
}

function parseRating(inputNumString: string): DolphinSRRating | undefined {
  switch (inputNumString) {
    case "1":
      return "easy";
    case "2":
      return "good";
    case "3":
      return "hard";
    case "4":
      return "again";
    default:
      return;
  }
}

class App {
  title = "letter-pair-trainer";
  card: {
    front: string;
    back: string;
    flipped: boolean;
    dolphinCard: DolphinSRCard;
  };
  nonBlank: { [key: string]: string };
  dolphin: Dolphin;
  ratings = RATINGS;
  loading = true;
  logContents = "";
  allReviews: DolphinSRReview[];

  sessionStats = { correct: 0, total: 0 };

  constructor() {}

  async init(): Promise<any> {
    // debug code for doing css stuff without slamming the db
    // this.loading = false;
    // this.card = {
    //   front: "front",
    //   back: "back",
    //   flipped: true,
    //   dolphinCard: null,
    // };
    // return;

    try {
      this.dolphin = new DolphinSR();

      const grid = await getGrid();
      const uuidsInFirestore = readUuids(); // todo: rename firestore vars

      this.nonBlank = grid.getNonBlank();

      const gridNonBlank = grid.getNonBlank();
      const missingFromFirestore = [];
      for (let letterPair of Object.keys(gridNonBlank)) {
        const image = gridNonBlank[letterPair];
        const firestoreKey = makeKey(letterPair, image);
        if (!uuidsInFirestore[firestoreKey]) {
          missingFromFirestore.push(firestoreKey);
        }
      }
      if (missingFromFirestore.length) {
        this.log(
          `Adding ${missingFromFirestore.length}: ${missingFromFirestore}`
        );
      }
      const addToFirestore = {};
      for (let key of missingFromFirestore) {
        const uuid = generateId();
        addToFirestore[key] = uuid;
      }
      Object.keys(addToFirestore).forEach(key => {
        storeUuid(key, addToFirestore[key]);
      });

      const itemsInSheet: Card[] = (() => {
        const result: Card[] = [];
        for (let letterPair of Object.keys(gridNonBlank)) {
          const image = gridNonBlank[letterPair];
          const firestoreKey = makeKey(letterPair, image);
          const id = uuidsInFirestore[firestoreKey]
            ? uuidsInFirestore[firestoreKey]
            : addToFirestore[firestoreKey];
          result.push({ letterPair, image, id });
        }
        return result;
      })();

      this.allReviews = readReviews();
      const reviews = this.allReviews.filter(review =>
        itemsInSheet.map(item => item.id).includes(review.master)
      );
      const uuidCount = Object.keys(uuidsInFirestore).length;
      this.log(`Fetched ${uuidCount} uuids, ${this.allReviews.length} reviews`); // todo response time

      this.dolphin.addMasters(...itemsInSheet.map(createMaster));
      // according to readme, this is fastest when reviews are in chronological ascending order.
      // looks like things come back from firestore in the right order, nice
      this.dolphin.addReviews(...reviews);

      this.showSummary();

      this.getNextCard();
    } catch (error) {
      this.log(error.message);
      throw error;
    }
  }

  getNextCard(): void {
    this.loading = false;
    const card = this.dolphin.nextCard();
    if (card) {
      const front = card.front[0];
      const back = card.back[0];
      this.card = { front, back, flipped: false, dolphinCard: card };
    } else {
      this.card = null;
    }
  }

  handleCardClick(): void {
    this.card.flipped = true;
  }

  handleRatingClick(rating: DolphinSRRating): void {
    const correct = rating === "easy" || rating === "good";
    const prefix = correct ? " " : "*";
    if (correct) {
      this.sessionStats.correct++;
    }
    this.sessionStats.total++;

    this.log(
      `${prefix} ${this.card.front} ${rating}. ${this.sessionStats.correct}/${this.sessionStats.total}`
    );

    if (this.sessionStats.total % 10 === 0) {
      this.showSummary();
    }

    const review: DolphinSRReview = {
      master: this.card.dolphinCard.master,
      combination: this.card.dolphinCard.combination,
      ts: new Date(),
      rating: rating,
    };
    this.loading = true;
    storeReview(review);
    this.dolphin.addReviews(review);
    this.getNextCard();
  }

  log(message: string) {
    this.logContents += message + "\n";
    console.log(message);
    // const textarea = document.getElementById("log") as HTMLTextAreaElement;
    // textarea.scrollTop = textarea.scrollHeight;
  }

  showSummary(): void {
    const summary = this.dolphin.summary();
    this.log("");
    this.log("Due:      " + summary.due);
    this.log("Later:    " + summary.later);
    this.log("Learning: " + summary.learning);
    this.log("Overdue:  " + summary.overdue);
    this.log("");
  }
}

function createMaster(card: Card): DolphinSRMaster {
  return {
    id: card.id,
    combinations: [{ front: [0], back: [1] }],
    fields: [card.letterPair, card.image],
  };
}

main();
