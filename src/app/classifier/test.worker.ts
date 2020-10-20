import { SVM } from "libsvm-ts";
import * as tf from "@tensorflow/tfjs-core";
import * as useTF from "@tensorflow-models/universal-sentence-encoder";

// @ts-ignore
import wasmPath from "../node_modules/@tensorflow/tfjs-backend-wasm/dist/tfjs-backend-wasm.wasm";

import "@tensorflow/tfjs-backend-wasm";
import "@tensorflow/tfjs-backend-webgl";
import Data from "app/data_clients/datainterfaces";
import TFIDFTransformer, { Counter } from "app/classifier/tfidf";
import { TableNames, workerDB } from "app/database/database";
import { sortBy } from "lodash";
import SVMTrainer from "app/classifier/SVMTrainer";
import logger from "app/utils/logger";
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
  tf.add(5, 3).print();
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
type Event = {
  kind: EventKinds;
  payload: unknown;
};
export interface TFIDFEvent extends Event {
  kind: EventKinds.tfidf;
  payload: {
    exampleIds: string[];
  };
}
export interface TrainSVMEvent extends Event {
  kind: EventKinds.trainSVM;
  payload: {};
}
export interface InsertToDBEvent extends Event {
  kind: EventKinds.insertToDb;
  payload: {
    examples: Data.Example[];
  };
}

export interface VecotizeEvent extends Event {
  kind: EventKinds.vectorize;
  payload: {};
}

export interface ValidateModelEvent extends Event {
  kind: EventKinds.validateModel;
  payload: {};
}

async function validateModel(event: MessageEvent<ValidateModelEvent>) {
  logger("Begin Model Validation");
  const labelVocab: Record<string, number> = {};
  let maxLabelId: number = 0;
  const trainingFormat: { samples: number[][]; labels: number[] } = {
    samples: [],
    labels: [],
  };

  const labeledTFIDFArray = (await workerDB.vector
    .where("hasLabel")
    .equals(1)
    .toArray()) as Required<Data.Vector>[];
  logger(`Fetched ${labeledTFIDFArray.length} labeled examples`);
  labeledTFIDFArray.forEach((tf) => {
    trainingFormat.samples.push(tf.vector);
    if (!labelVocab[tf.label]) {
      labelVocab[tf.label] = 1 + maxLabelId - 1;
      maxLabelId += 1;
    }
    let labelId = labelVocab[tf.label];
    trainingFormat.labels.push(labelId);
  });
  logger(`Loading Trainer`);
  const trainer = new SVMTrainer();
  await trainer.init();
  logger(`Trainer Initialized`);
  for await (let result of trainer.kFoldEvaluate(
    trainingFormat.samples,
    trainingFormat.labels,
    5
  )) {
    logger(`Finished a loop. Sending to db`);
    await workerDB.kfold.bulkAdd(result);
    logger(`Inserted starting next`);
  }
  logger(`Finished KFOLD Evaluation`);
}
// Respond to message from parent thread
async function handleTfIdf(event: MessageEvent<TFIDFEvent>) {
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
  console.log("tfidf", tfidf);
  ctx.postMessage(tfidf);
}

async function insertToDB(event: MessageEvent<InsertToDBEvent>) {
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
async function vectorize(event: MessageEvent<any>) {
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
async function trainSVM(event: MessageEvent<any>) {
  const labelVocab: Record<string, number> = {};
  let maxLabelId: number = 0;
  const trainingFormat: { samples: number[][]; labels: number[] } = {
    samples: [],
    labels: [],
  };

  const labeledTFIDFArray = (await workerDB.vector
    .where("hasLabel")
    .equals(1)
    .toArray()) as Required<Data.Vector>[];
  labeledTFIDFArray.forEach((tf) => {
    trainingFormat.samples.push(tf.vector);
    if (!labelVocab[tf.label]) {
      labelVocab[tf.label] = 1 + maxLabelId - 1;
      maxLabelId += 1;
    }
    let labelId = labelVocab[tf.label];
    trainingFormat.labels.push(labelId);
  });
  console.log(labelVocab);
  const inverseLabelVoab: Record<number, string> = {};
  for (const key in labelVocab) {
    const lid = labelVocab[key];
    inverseLabelVoab[lid] = key;
  }
  const unlabeledExamples = await workerDB.vector
    // .where("hasLabel")
    // .equals(-1)
    // .limit(200)
    .toArray();
  const unlabeledTfIDF = unlabeledExamples.map((x) => x.vector);

  //@ts-ignore
  const loadedSVM = svm.loaded
    ? await Promise.resolve(svm)
    : await svm.loadWASM();

  console.log(trainingFormat);
  loadedSVM.train(trainingFormat);
  const result = loadedSVM.predictProbability({ samples: unlabeledTfIDF });
  const updates = result.map((res, ix) => {
    const exampleId = unlabeledExamples[ix].exampleId;
    const predictedLabel = inverseLabelVoab[res.prediction];
    const update = {
      exampleId,
      update: {
        predictedLabel,
        hasPrediction: 1,
        confidence: res.estimates[res.prediction].probability,
      },
    };
    return update;
  });
  await workerDB.transaction("rw", "example" as TableNames, async (tx) => {
    await Promise.all(
      updates.map((update) => {
        workerDB.example.update(update.exampleId, update.update);
      })
    );
  });
  console.log(
    result.map((x) => ({
      label: inverseLabelVoab[x.prediction],
      est: x.estimates,
    }))
  );
}
async function workerDispatch(
  event: MessageEvent<
    | InsertToDBEvent
    | TFIDFEvent
    | TrainSVMEvent
    | VecotizeEvent
    | ValidateModelEvent
  >
) {
  switch (event.data.kind) {
    case EventKinds.tfidf:
      return handleTfIdf(event as MessageEvent<TFIDFEvent>);
    case EventKinds.insertToDb:
      return insertToDB(event as MessageEvent<InsertToDBEvent>);
    case EventKinds.trainSVM:
      return trainSVM(event);
    case EventKinds.vectorize:
      return vectorize(event);
    case EventKinds.validateModel:
      return validateModel(event as MessageEvent<ValidateModelEvent>);
  }
}

ctx.addEventListener("message", workerDispatch);
