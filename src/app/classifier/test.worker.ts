import Data from "app/data_clients/datainterfaces";
import TFIDFTransformer from "app/classifier/tfidf";
import { workerDB } from "app/database/database";

const ctx: Worker = self as any;

// Post data to parent thread
ctx.postMessage({ foo: "foo" });
export const enum EventKinds {
  tfidf = "tfidf",
  insertToDb = "insertToDb",
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

// async function trainSVM(event: MessageEvent<any>) {
//   const labeledExamples = await workerDB.example
//     .where("hasLabel")
//     .equals(1)
//     .toArray();
//   const unlabeledExampleIds = await workerDB.example
//     .where("hasLabel")
//     .equals(-1)
//     .primaryKeys();
//   const labeledTFIDF = await workerDB.tfidf.bulkGet(labeledExampleIds);
//   const unlabeledTFIDF = await workerDB.tfidf.bulkGet(unlabeledExampleIds);
// }
async function workerDispatch(
  event: MessageEvent<InsertToDBEvent | TFIDFEvent>
) {
  if (event.data.kind === EventKinds.tfidf) {
    return handleTfIdf(event as MessageEvent<TFIDFEvent>);
  }
  if (event.data.kind === EventKinds.insertToDb) {
    return insertToDB(event as MessageEvent<InsertToDBEvent>);
  }
}

ctx.addEventListener("message", workerDispatch);
