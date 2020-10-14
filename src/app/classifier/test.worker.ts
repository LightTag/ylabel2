import Data from "app/data_clients/datainterfaces";
import { exampleStoreIndexDB } from "app/data_clients/exampleDataStore";
import TFIDFTransformer from "app/classifier/tfidf";

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
  const exampleIds = event.data.payload.exampleIds;
  const examplesOrNull: (Data.Example | null)[] = await Promise.all(
    exampleIds.map((exId) => exampleStoreIndexDB.getItem<Data.Example>(exId))
  );
  const examples = examplesOrNull.filter((x) => x !== null) as Data.Example[];
  const tfidf = transformer.fitTransform(examples);
  console.log(`Asked for ${exampleIds.length} got back ${examples.length}`);
  console.log("tfidf", tfidf);
  ctx.postMessage(tfidf);
}

async function insertToDB(event: MessageEvent<InsertToDBEvent>) {
  const examples = event.data.payload.examples;
  await exampleStoreIndexDB.setItems(
    examples.map((ex) => ({ key: ex.exampleId, value: ex }))
  );
  console.log(`Inserted ${examples.length}`);
}

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
