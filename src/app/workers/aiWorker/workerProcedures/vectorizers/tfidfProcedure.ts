// Respond to message from parent thread
import TFIDFTransformer from "app/workers/aiWorker/workerProcedures/vectorizers/tfidf";
import { workerDB } from "app/database/database";
import NSAIWorker from "app/workers/aiWorker/aiWorkerTypes";

export async function handleTfIdf(event: NSAIWorker.Request.IStartVectorize) {
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
}
