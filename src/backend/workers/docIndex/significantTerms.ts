import { workerDB } from "../../database/database";
import { sortBy } from "lodash";
import {
  Counter,
  tokenizingRegex,
} from "../aiWorker/workerProcedures/vectorizers/tfidf";
import { SignificantTerm } from "./indexWorkerTypes";

async function significantTermsForLabel(
  label: string
): Promise<SignificantTerm[]> {
  const examplesWithLabel = await workerDB.example
    .where({ label: label })
    .toArray();

  const otherExamples = await workerDB.example
    .where("label")
    .notEqual(label)
    .toArray();

  const numLabeled = examplesWithLabel.length;
  const numUnlabeled = otherExamples.length;
  const labeledCounter = new Counter();
  const otherCounter = new Counter();

  if (numLabeled < 3) {
    return [];
  }

  examplesWithLabel.forEach((example) => {
    const wordSet = new Set<string>();
    example.content.split(tokenizingRegex).forEach((word) => {
      wordSet.add(word);
    });
    wordSet.forEach((word) => labeledCounter.increment(word));
  });

  otherExamples.forEach((example) => {
    const wordSet = new Set<string>();
    example.content.split(tokenizingRegex).forEach((word) => {
      wordSet.add(word);
    });
    wordSet.forEach((word) => otherCounter.increment(word));
  });
  const result: { word: string; score: number }[] = [];
  Object.entries(labeledCounter.items).forEach(([word, labledCount]) => {
    const weightedLabeledCount = labledCount / numLabeled;
    const weightedUnlabledCount = otherCounter.get(word) / numUnlabeled;
    const score = weightedLabeledCount / (weightedUnlabledCount + 1);
    if (
      isFinite(score) &&
      weightedUnlabledCount > 0 &&
      weightedLabeledCount > 0.2 &&
      weightedUnlabledCount < 0.5
    ) {
      //Infinite scores means the word has already been labeled in every appearence
      result.push({ word, score });
    }
  });
  const res = sortBy(result, (x) => -x.score);
  return res;
}

export default significantTermsForLabel;
