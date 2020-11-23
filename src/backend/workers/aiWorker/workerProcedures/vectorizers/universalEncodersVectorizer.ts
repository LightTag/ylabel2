import * as useTF from "@tensorflow-models/universal-sentence-encoder";
import { workerDB } from "../../../../database/database";
import { sortBy } from "lodash";
import Data from "../../../..//data_clients/datainterfaces";
import NSAIWorker from "../../../..//workers/aiWorker/aiWorkerTypes";
import { GenericWorkerTypes } from "../../../common/datatypes";
import logger from "../../../../utils/logger";

export async function universalEncodersVectorize(
  event: NSAIWorker.Request.IStartVectorize,
  tf: any
): Promise<NSAIWorker.Response.IEndVectorize> {
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

    const vectors = await model.embed(batch.map((x) => x.content));

    const embed_end = performance.now();
    const embed_time = embed_end - embed_start;
    logger(`emebd in ${embed_time} ms `);
    const vectorsArray = await vectors.array();

    tf.dispose(vectors);
    const insertBatch: Data.Vector[] = [];

    vectorsArray.forEach((vec, ix) => {
      const example = batch[ix];
      insertBatch.push({
        exampleId: example.exampleId as string,
        hasLabel: example.hasLabel,
        label: example.label,
        vector: vec,
        rejectedLabels: [],
        hasNegativeOrRejectedLabel: example.hasNegativeOrRejectedLabel || -1,
      });
    });
    const insert_start = performance.now();
    await workerDB.vector.bulkAdd(insertBatch).then(() => {
      const insert_end = performance.now();
      logger(`insert in ${insert_end - insert_start} ms`);
    });
    logger(`Inserted ${start} to ${start + step}`);
  }

  return {
    workerName: GenericWorkerTypes.EWorkerName.ai,
    requestId: event.requestId,
    direction: GenericWorkerTypes.ERquestOrResponesOrUpdate.response,
    kind: NSAIWorker.AIResponseMessageKind.endVectorize,
    payload: {},
  };
}
