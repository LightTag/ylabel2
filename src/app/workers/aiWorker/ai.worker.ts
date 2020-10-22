import { SVM } from "libsvm-ts";
import * as tf from "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-backend-wasm";
import "@tensorflow/tfjs-backend-webgl";
import Data from "app/data_clients/datainterfaces";
import { Counter } from "app/workers/aiWorker/workerProcedures/vectorizers/tfidf";
import { workerDB } from "app/database/database";
import logger from "app/utils/logger";
import { assertNever } from "../../../typing/utils";
import NSAIWorker from "app/workers/aiWorker/aiWorkerTypes";
import { validateModel } from "app/workers/aiWorker/workerProcedures/validateModel";
import { handleTfIdf } from "app/workers/aiWorker/workerProcedures/vectorizers/tfidfProcedure";
import { universalEncodersVectorize } from "app/workers/aiWorker/workerProcedures/vectorizers/universalEncodersVectorizer";
import { trainSVM } from "app/workers/aiWorker/workerProcedures/trainSvm";
import AIRequestMessageKind = NSAIWorker.AIRequestMessageKind;

console.log(tf);
const ctx: Worker = self as any;

let svm = new SVM({
  // Having trouble tuning these ? Look at the outputs and then read https://www.csie.ntu.edu.tw/~cjlin/libsvm/faq.html#f427
  type: "C_SVC",
  kernel: "LINEAR",
  cost: 1,
  gamma: 0.00000001,
  probabilityEstimates: true,
});
async function run() {
  await tf.setBackend("webgl");
}
run();

// Post data to parent thread
ctx.postMessage({ foo: "foo" });

export const enum EventKinds {
  tfidf = "tfidf",
  insertToDb = "insertToDb",
  trainSVM = "trainSVM",
  vectorize = "vectorize",
  validateModel = "validateModel",
}

export interface InsertToDBEvent extends Event {
  //TODO  This needs to move to its own module and worker

  kind: EventKinds.insertToDb;
  payload: {
    examples: Data.Example[];
  };
}

async function insertToDB(event: MessageEvent<InsertToDBEvent>) {
  //TODO  This needs to move to its own module and worker

  const examples = event.data.payload.examples;
  const uniqueLabelSet = new Counter();
  examples.forEach((ex) => {
    if (ex.label) {
      uniqueLabelSet.increment(ex.label);
    }
  });
  const newLabels: Data.Label[] = Object.entries(uniqueLabelSet.items).map(
    ([name, count]) => ({
      name,
      count,
      kind: "label",
    })
  );
  workerDB.example.bulkAdd(examples).catch((e) => {
    console.log(
      "Dexie rejected a bulka dd but we caught it because its about duplicate string. If we didn't catch it the transaction would abort"
    );
  });
  workerDB.label.bulkAdd(newLabels);
  console.log(`Inserted ${examples.length}`);
}

async function aiWorkerDispatch(
  event: MessageEvent<InsertToDBEvent | NSAIWorker.Request.AIWorkerRequests>
) {
  if (event.data.kind === EventKinds.insertToDb) {
    return insertToDB(event as MessageEvent<InsertToDBEvent>);
  }
  switch (event.data.kind) {
    case AIRequestMessageKind.startVectorize:
      const method = event.data.payload.method;
      switch (method) {
        case "tfidf":
          return handleTfIdf(
            event as MessageEvent<NSAIWorker.Request.IStartVectorize>
          );
        case "universalSentenceEncoder":
          return universalEncodersVectorize(
            event as MessageEvent<NSAIWorker.Request.IStartVectorize>
          );
        default:
          logger(`Got a vecotrization request with unkown method ${method}`);
        // assertNever(event.data.payload.method);
      }

    case AIRequestMessageKind.startFitPredict:
      return trainSVM(
        event as MessageEvent<NSAIWorker.Request.IStartFitPredict>
      );
    case NSAIWorker.AIRequestMessageKind.startValidation:
      return validateModel(
        event as MessageEvent<NSAIWorker.Request.IStartValidate>
      );
    default:
      assertNever(event.data);
  }
}

ctx.addEventListener("message", aiWorkerDispatch);
