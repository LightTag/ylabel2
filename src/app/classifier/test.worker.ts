import { SVM } from "libsvm-ts";
import * as tf from "@tensorflow/tfjs-core";
import * as useTF from "@tensorflow-models/universal-sentence-encoder";

import "@tensorflow/tfjs-backend-cpu";
import Data from "app/data_clients/datainterfaces";
import TFIDFTransformer from "app/classifier/tfidf";
import { workerDB } from "app/database/database";
console.log(tf);
const ctx: Worker = self as any;
debugger;
let svm = new SVM({
  type: "NU_SVC",
  kernel: "LINEAR",
  cost: 5,
  gamma: 0.001,
});
debugger;

// Post data to parent thread
ctx.postMessage({ foo: "foo" });
export const enum EventKinds {
  tfidf = "tfidf",
  insertToDb = "insertToDb",
  trainSVM = "trainSVM",
  vectorize = "vectorize",
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
// Respond to message from parent thread
async function handleTfIdf(event: MessageEvent<TFIDFEvent>) {
  const transformer = new TFIDFTransformer();
  const examples = await workerDB.example.toArray();
  const tfidf = transformer.fitTransform(examples);
  console.log("start tfidf", tfidf);
  workerDB.tfidf.bulkAdd(
    Object.values(tfidf).map((x) => ({
      dict: x,
      arr: Object.values(x),
      hasLabel: -1,
    })),
    Object.keys(tfidf)
  );
  console.log("tfidf", tfidf);
  ctx.postMessage(tfidf);
}

async function insertToDB(event: MessageEvent<InsertToDBEvent>) {
  const examples = event.data.payload.examples;
  workerDB.example.bulkAdd(examples);

  console.log(`Inserted ${examples.length}`);
}
async function vectorize(event: MessageEvent<any>) {
  const model = await useTF.load();
  const allText = await workerDB.example.toArray();
  const step = 4;
  for (let start = 0; start < allText.length; start += 8) {
    const batch = allText.slice(start, start + step);
    const vectors = await model.embed(batch.map((x) => x.content));
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
    await workerDB.vector.bulkAdd(insertBatch);
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
      labelVocab[tf.label] = maxLabelId;
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
  const unlabeledTfIDF = (
    await workerDB.vector.where("hasLabel").equals(-1).limit(200).toArray()
  ).map((x) => x.vector);
  //@ts-ignore
  const loadedSVM = svm.loaded
    ? await Promise.resolve(svm)
    : await svm.loadWASM();
  console.log(trainingFormat);
  loadedSVM.train(trainingFormat);
  const result = loadedSVM.predictProbability({ samples: unlabeledTfIDF });
  console.log(
    result.map((x) => ({
      label: inverseLabelVoab[x.prediction],
      est: x.estimates,
    }))
  );
}
async function workerDispatch(
  event: MessageEvent<
    InsertToDBEvent | TFIDFEvent | TrainSVMEvent | VecotizeEvent
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
  }
}

ctx.addEventListener("message", workerDispatch);
