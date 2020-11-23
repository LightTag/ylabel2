import * as tf from "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-backend-cpu";
import "@tensorflow/tfjs-backend-webgl";
import Data from "../../data_clients/datainterfaces";
import { Counter } from "../..//workers/aiWorker/workerProcedures/vectorizers/tfidf";
import { workerDB } from "../..//database/database";
import NSAIWorker from "../../workers/aiWorker/aiWorkerTypes";
import { validateModel } from "./workerProcedures/validateModel";
import { handleTfIdf } from "./workerProcedures/vectorizers/tfidfProcedure";
import { universalEncodersVectorize } from "./workerProcedures/vectorizers/universalEncodersVectorizer";
import { trainSVM } from "./workerProcedures/trainSvm";
import { GenericWorkerTypes } from "../common/datatypes";
import { assertNever } from "../../../typing/utils";
import logger, { EventKinds } from "../../utils/logger";

// eslint-disable-next-line no-restricted-globals
const ctx: Worker = self as any;
tf.env().set("WEBGL_DELETE_TEXTURE_THRESHOLD", 0);

async function run() {
  await tf.setBackend("webgl");
}

run();

// Post data to parent thread
ctx.postMessage({ foo: "foo" });

export interface InsertToDBEvent extends GenericWorkerTypes.GenericEvent {
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
    logger(
      "Dexie rejected a bulka dd but we caught it because its about duplicate string. If we didn't catch it the transaction would abort"
    );
  });
  workerDB.label.bulkAdd(newLabels);
  logger(`Inserted ${examples.length}`);
}

async function _aiWorkerDispatch(
  event: MessageEvent<InsertToDBEvent | NSAIWorker.Request.AIWorkerRequests>
): Promise<NSAIWorker.Response.Responses> {
  switch (event.data.kind) {
    case EventKinds.insertToDb:
      //@ts-ignore
      return insertToDB(event as MessageEvent<InsertToDBEvent>);

    case NSAIWorker.AIRequestMessageKind.startFitPredict:
      return trainSVM(event.data);

    case NSAIWorker.AIRequestMessageKind.startValidation:
      return validateModel(event.data);

    case NSAIWorker.AIRequestMessageKind.startVectorize:
      const method = event.data.payload.method;
      switch (method) {
        case "tfidf":
          return handleTfIdf(event.data);
        case "universalSentenceEncoder":
          return universalEncodersVectorize(event.data, tf);
        default:
          logger(`Got a vecotrization request with unkown method ${method}`);
          assertNever(event.data as never);
      }
  }
}

async function aiWorkerDispatch(
  event: MessageEvent<InsertToDBEvent | NSAIWorker.Request.AIWorkerRequests>
) {
  const response = await _aiWorkerDispatch(event);
  if (response) {
    ctx.postMessage(response);
  }
}

ctx.addEventListener("message", aiWorkerDispatch);
