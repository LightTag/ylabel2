import { SVM } from "libsvm-ts";

import Data from "app/data_clients/datainterfaces";
import TFIDFTransformer from "app/classifier/tfidf";
import { workerDB } from "app/database/database";

const ctx: Worker = self as any;
const svm = new SVM({
  type: "C_SVC",
  kernel: "RBF",
  gamma: 1,
  cost: 1,
});

// Post data to parent thread
ctx.postMessage({ foo: "foo" });
export const enum EventKinds {
  tfidf = "tfidf",
  insertToDb = "insertToDb",
  trainSVM = "trainSVM",
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

async function trainSVM(event: MessageEvent<any>) {
  debugger;
  const labelVocab: Record<string, number> = {};
  let maxLabelId: number = 0;
  const trainingFormat: { samples: number[][]; labels: number[] } = {
    samples: [],
    labels: [],
  };
  const labeledTFIDFArray = (await workerDB.tfidf
    .where("hasLabel")
    .equals(1)
    .toArray()) as Required<Data.TFIDF>[];
  labeledTFIDFArray.forEach((tf) => {
    trainingFormat.samples.push(tf.arr);
    if (!labelVocab[tf.label]) {
      labelVocab[tf.label] = maxLabelId;
      maxLabelId += 1;
    }
    let labelId = labelVocab[tf.label];
    trainingFormat.labels.push(labelId);
  });

  const unlabeledTfIDF = (
    await workerDB.tfidf.where("hasLabel").equals(-1).toArray()
  ).map((x) => x.arr);

  const loadedSVM = await svm.loadWASM();
  loadedSVM.train(trainingFormat);
  const result = loadedSVM.predictProbability({ samples: unlabeledTfIDF });
  console.log(result);
}
async function workerDispatch(
  event: MessageEvent<InsertToDBEvent | TFIDFEvent | TrainSVMEvent>
) {
  switch (event.data.kind) {
    case EventKinds.tfidf:
      return handleTfIdf(event as MessageEvent<TFIDFEvent>);
    case EventKinds.insertToDb:
      return insertToDB(event as MessageEvent<InsertToDBEvent>);
    case EventKinds.trainSVM:
      return trainSVM(event);
  }
}

ctx.addEventListener("message", workerDispatch);
