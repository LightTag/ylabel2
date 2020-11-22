// Respond to message from parent thread
import TFIDFTransformer from "../../../..//workers/aiWorker/workerProcedures/vectorizers/tfidf";
import { workerDB } from "../../../../database/database";
import NSAIWorker from "../../../..//workers/aiWorker/aiWorkerTypes";
import { GenericWorkerTypes } from "../../../common/datatypes";

export async function handleTfIdf(
  event: NSAIWorker.Request.IStartVectorize
): Promise<NSAIWorker.Response.IEndVectorize> {
  const transformer = new TFIDFTransformer();
  const examples = await workerDB.example.toArray();
  const tfidf = transformer.fitTransform(examples);

  console.log("start tfidf", tfidf);
  workerDB.tfidf.bulkAdd(
    Object.values(tfidf).map((x, ix) => ({
      dict: x,
      arr: Object.values(x),
      hasLabel: examples[ix].hasLabel,
      exampleId: examples[ix].exampleId,
      label: examples[ix].label,
      hasNegativeOrRejectedLabel: examples[ix].hasNegativeOrRejectedLabel,
      rejectedLabels: examples[ix].rejectedLabels,
    }))
  );
  return {
    workerName: GenericWorkerTypes.EWorkerName.ai,
    requestId: event.requestId,
    direction: GenericWorkerTypes.ERquestOrResponesOrUpdate.response,
    kind: NSAIWorker.AIResponseMessageKind.endVectorize,
    payload: {},
  };
}
