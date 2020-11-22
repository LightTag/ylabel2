import { workerDB } from "../../database/database";
import { sortBy } from "lodash";
import {
  Counter,
  tokenizingRegex,
} from "../aiWorker/workerProcedures/vectorizers/tfidf";

async function significantTermsForLabel(label: string) {
  const examplesWithLabel = await workerDB.example
    .where({ label: label })
    .toArray();

  const otherExamples = await workerDB.example
    .where("label")
    .notEqual(label)
    .or("hasLabel")
    .equals(-1)
    .toArray();

  const numLabeled = examplesWithLabel.length;
  const numUnlabeled = otherExamples.length;
  const labeledCounter = new Counter();
  const otherCounter = new Counter();

  if (numLabeled < 3) {
    return [];
  }

  examplesWithLabel.forEach((example) => {
    example.content.split(tokenizingRegex).forEach((word) => {
      labeledCounter.increment(word);
    });
  });

  otherExamples.forEach((example) => {
    example.content.split(tokenizingRegex).forEach((word) => {
      otherCounter.increment(word);
    });
  });
  const result: { word: string; score: number }[] = [];
  Object.entries(labeledCounter.items).forEach(([word, labledCount]) => {
    const weightedLabeledCount = labledCount / numLabeled;
    const weightedUnlabledCount = otherCounter.get(word) / numUnlabeled;
    const score = weightedLabeledCount / weightedUnlabledCount;
    if (isFinite(score)) {
      //Infinite scores means the word has already been labeled in every appearence
      result.push({ word, score });
    }
  });
  return sortBy(result, (x) => -x.score);
}
export default significantTermsForLabel;
