import * as useTF from "@tensorflow-models/universal-sentence-encoder";
import { workerDB } from "app/database/database";
import { sortBy } from "lodash";
import Data from "app/data_clients/datainterfaces";
import NSAIWorker from "app/workers/aiWorker/aiWorkerTypes";

export async function universalEncodersVectorize(
  event: NSAIWorker.Request.IStartVectorize
) {
  const model = await useTF.load();
  const hasVectorIds = await workerDB.vector.toCollection().primaryKeys();

  const allText = await workerDB.example
    .where("exampleId")
    .noneOf(hasVectorIds)
    .toArray();
  const step = 8;
  const sortedAllText = sortBy(allText, (x) => x.content.length);
  for (let start = 0; start < allText.length; start += step) {
    const batch = sortedAllText.slice(start, start + step);
    const embed_start = performance.now();
    const vectors = await model.embed(batch.map((x) => x.content.slice(0, 64)));
    const embed_end = performance.now();
    const embed_time = embed_end - embed_start;
    console.log(`emebd in ${embed_time} ms `);
    const vectorsArray = await vectors.array();
    const insertBatch: Data.Vector[] = [];

    vectorsArray.forEach((vec, ix) => {
      const example = batch[ix];
      insertBatch.push({
        exampleId: example.exampleId as string,
        hasLabel: example.hasLabel,
        label: example.label,
        vector: vec,
      });
    });
    const insert_start = performance.now();

    await workerDB.vector.bulkAdd(insertBatch).then(() => {
      const insert_end = performance.now();
      console.log(`insert in ${insert_end - insert_start} ms`);
    });
    console.log(`Inserted ${start} to ${start + step}`);
  }
}
