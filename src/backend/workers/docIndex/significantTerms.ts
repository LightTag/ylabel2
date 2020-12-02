import { workerDB } from "../../database/database";
import { sortBy } from "lodash";

import { SignificantTerm } from "./indexWorkerTypes";

async function significantTermsForLabel(
  label: string
): Promise<SignificantTerm[]> {
  const wordScores: Record<string, number> = {};
  const examplesWithLabelIds = await workerDB.example
    .where({ label: label })
    .primaryKeys();

  const counterExampleIds = await workerDB.example
    .where("label")
    .notEqual(label)
    .primaryKeys();
  const [labelTFIDF, counterTFIDF] = await Promise.all([
    workerDB.tfidf.where("exampleId").anyOf(examplesWithLabelIds).toArray(),
    workerDB.tfidf.where("exampleId").anyOf(counterExampleIds).toArray(),
  ]);

  labelTFIDF.forEach((example) => {
    Object.entries(example.dict).forEach(([word, tfidf]) => {
      if (tfidf > 0) {
        if (wordScores[word]) {
          wordScores[word] += tfidf;
        } else {
          wordScores[word] = tfidf;
        }
      }
    });
  });
  counterTFIDF.forEach((example) => {
    Object.entries(example.dict).forEach(([word, tfidf]) => {
      if (tfidf > 0) {
        if (wordScores[word]) {
          wordScores[word] -= tfidf;
        }
      }
    });
  });
  const res = Object.entries(wordScores).map(([word, score]) => ({
    word,
    score,
  }));

  return sortBy(res, (x) => -x.score).slice(0, 100);
}

export default significantTermsForLabel;
