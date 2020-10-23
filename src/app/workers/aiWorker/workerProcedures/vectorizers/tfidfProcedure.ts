// Respond to message from parent thread
import TFIDFTransformer from "app/workers/aiWorker/workerProcedures/vectorizers/tfidf";
import { workerDB } from "app/database/database";
import NSAIWorker from "app/workers/aiWorker/aiWorkerTypes";
import AIResponseMessageKind = NSAIWorker.AIResponseMessageKind;
import { GenericWorkerTypes } from "app/workers/common/datatypes";
import ERquestOrResponesOrUpdate = GenericWorkerTypes.ERquestOrResponesOrUpdate;
import EWorkerName = GenericWorkerTypes.EWorkerName;

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
    }))
  );
  return {
    workerName: EWorkerName.ai,
    requestId: event.requestId,
    direction: ERquestOrResponesOrUpdate.response,
    kind: AIResponseMessageKind.endVectorize,
    payload: {},
  };
}
