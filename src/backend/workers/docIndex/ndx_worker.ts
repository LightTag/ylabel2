import createDocumentIndex, {
  IIndexAPI,
} from "../..//workers/docIndex/indexBuilder";
import { NSIndexWorker } from "./indexWorkerTypes";
import { assertNever } from "../../../typing/utils";
import { decode, encode } from "@msgpack/msgpack";

import { Index } from "ndx";
import {
  fromSerializable,
  SerializableIndex,
  toSerializable,
} from "ndx-serializable";

import { workerDB } from "../../database/database";
import Data from "../..//data_clients/datainterfaces";
import { GenericWorkerTypes } from "../common/datatypes";
import logger from "../../utils/logger";
import significantTermsForLabel from "./significantTerms";
import { Counter } from "../aiWorker/workerProcedures/vectorizers/tfidf";

interface WorkerWithIndex extends Worker {
  //TODO indicate that the index is possibly udnefined and check / send error messages
  index: IIndexAPI;
}

// eslint-disable-next-line no-restricted-globals
let ctx: WorkerWithIndex = self as any;

async function handleIndexRequest(
  message: MessageEvent<NSIndexWorker.Request.IStartIndex>
) {
  const examples = await workerDB.example.toArray();
  examples.forEach((ex) => ctx.index.add(ex));
  const serializedIndex: Uint8Array = encode(toSerializable(ctx.index._index));

  workerDB.indexCache.put({ data: serializedIndex, name: "index" });

  logger("Saved the index to disk");
  const response: NSIndexWorker.Response.IEndIndex = {
    workerName: GenericWorkerTypes.EWorkerName.index,
    direction: GenericWorkerTypes.ERquestOrResponesOrUpdate.response,

    requestId: message.data.requestId,
    kind: NSIndexWorker.IndexResponseMessageKind.endIndexing,
    payload: {
      numInserted: examples.length,
    },
  };
  return response;
}

function handleQueryRequest(
  message: MessageEvent<NSIndexWorker.Request.IStartQuery>
) {
  const queryString = message.data.payload.query;
  const results: NSIndexWorker.SearchResult[] = ctx.index
    .search(queryString)
    .map((res) => ({
      exampleId: res.key,
      score: res.score,
    }));
  const response: NSIndexWorker.Response.IEndQuery = {
    workerName: GenericWorkerTypes.EWorkerName.index,
    direction: GenericWorkerTypes.ERquestOrResponesOrUpdate.response,
    kind: NSIndexWorker.IndexResponseMessageKind.endQuery,
    requestId: message.data.requestId,
    payload: {
      results,
    },
  };
  return response;
}

async function handleStartInitRequest(
  message: MessageEvent<NSIndexWorker.Request.IStartInit>
) {
  const indexName = message.data.payload.indexName || "index"; //The default name
  const serializedIndex:
    | Data.SerializedIndex
    | undefined = await workerDB.indexCache.get(indexName);
  let loadedFromCache = false;
  if (serializedIndex) {
    logger("Found a serialized index");
    const _index = fromSerializable(
      decode(serializedIndex.data) as SerializableIndex<string>
    ) as Index<string>;
    if (_index) {
      //Possibly returns undefined, not sure why.
      ctx.index = createDocumentIndex(["content"], _index);
      loadedFromCache = true;
    } else {
      logger("Found a serialized index but it wouldnt pasrse");
    }
  }
  if (!loadedFromCache) {
    logger("Starting New Index");
    ctx.index = createDocumentIndex(["content"]);
    logger("Done New Index");
  }

  const response: NSIndexWorker.Response.IEndInit = {
    workerName: GenericWorkerTypes.EWorkerName.index,
    direction: GenericWorkerTypes.ERquestOrResponesOrUpdate.response,

    requestId: message.data.requestId,
    kind: NSIndexWorker.IndexResponseMessageKind.endInit,
    payload: {
      numIndexed: ctx.index._index.docs.size,
    },
  };
  return response;
}
async function handleSignificantTerms(
  message: MessageEvent<NSIndexWorker.Request.IStartSignificantTerms>
) {
  const terms = await significantTermsForLabel(message.data.payload.labelName);
  const response: NSIndexWorker.Response.IEndSignificantTerms = {
    workerName: GenericWorkerTypes.EWorkerName.index,
    direction: GenericWorkerTypes.ERquestOrResponesOrUpdate.response,

    requestId: message.data.requestId,
    kind: NSIndexWorker.IndexResponseMessageKind.endSignificantTerms,
    payload: {
      labelName: message.data.payload.labelName,
      terms,
    },
  };
  return response;
}

async function insertToDB(
  message: MessageEvent<NSIndexWorker.Request.IStartDataInsert>
) {
  //TODO  This needs to move to its own module and worker

  const examples = message.data.payload.examples;
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
  await workerDB.example.bulkAdd(examples).catch((e) => {
    logger(
      "Dexie rejected a bulka dd but we caught it because its about duplicate string. If we didn't catch it the transaction would abort"
    );
  });
  await workerDB.label.bulkAdd(newLabels);
  logger(`Inserted ${examples.length}`);
  const response: NSIndexWorker.Response.IEndDataInsert = {
    workerName: GenericWorkerTypes.EWorkerName.index,
    direction: GenericWorkerTypes.ERquestOrResponesOrUpdate.response,

    requestId: message.data.requestId,
    kind: NSIndexWorker.IndexResponseMessageKind.endDataInsert,
    payload: {
      numInserted: examples.length,
    },
  };
  return response;
}

async function _messageDispatch(
  message: MessageEvent<any>
): Promise<NSIndexWorker.Response.TResponse> {
  const kind: NSIndexWorker.IndexRequestMessageKind | undefined =
    message.data.kind;

  if (!kind) {
    //@ts-ignore
    return;
  }

  switch (kind) {
    case NSIndexWorker.IndexRequestMessageKind.startIndexing:
      return handleIndexRequest(message);
    case NSIndexWorker.IndexRequestMessageKind.startQuery:
      return handleQueryRequest(message);
    case NSIndexWorker.IndexRequestMessageKind.startInit:
      return handleStartInitRequest(message);
    case NSIndexWorker.IndexRequestMessageKind.startSignificantTerms:
      return handleSignificantTerms(message);
    case NSIndexWorker.IndexRequestMessageKind.startDataInsert:
      return insertToDB(message);
    default:
      assertNever(kind);
  }
}

async function messageDispatch(message: MessageEvent<any>) {
  const response = await _messageDispatch(message);

  ctx.postMessage(response);
}
ctx.addEventListener("message", messageDispatch);
