import * as tf from "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-backend-cpu";
import "@tensorflow/tfjs-backend-webgl";
import NSAIWorker from "../../workers/aiWorker/aiWorkerTypes";
import { validateModel } from "./workerProcedures/validateModel";
import { handleTfIdf } from "./workerProcedures/vectorizers/tfidfProcedure";
import { universalEncodersVectorize } from "./workerProcedures/vectorizers/universalEncodersVectorizer";
import { trainSVM } from "./workerProcedures/trainSvm";
import { assertNever } from "../../../typing/utils";
import logger from "../../utils/logger";

// eslint-disable-next-line no-restricted-globals
const ctx: Worker = self as any;
tf.env().set("WEBGL_DELETE_TEXTURE_THRESHOLD", 0);

async function run() {
  await tf.setBackend("webgl");
}

run();

// Post data to parent thread
ctx.postMessage({ foo: "foo" });

async function _aiWorkerDispatch(
  event: MessageEvent<NSAIWorker.Request.AIWorkerRequests>
): Promise<NSAIWorker.Response.Responses> {
  switch (event.data.kind) {
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
  event: MessageEvent<NSAIWorker.Request.AIWorkerRequests>
) {
  const response = await _aiWorkerDispatch(event);
  if (response) {
    ctx.postMessage(response);
  }
}

ctx.addEventListener("message", aiWorkerDispatch);
