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

interface WorkerWithIndex extends Worker {
  //TODO indicate that the index is possibly udnefined and check / send error messages
  index: IIndexAPI;
}

// eslint-disable-next-line no-restricted-globals
let ctx: WorkerWithIndex = self as any;

function handleIndexRequest(
  message: MessageEvent<NSIndexWorker.Request.IStartIndex>
) {
  const examples = message.data.payload.examples;
  examples.forEach((ex) => ctx.index.add(ex));
  const serializedIndex: Uint8Array = encode(toSerializable(ctx.index._index));

  workerDB.indexCache.add({ data: serializedIndex, name: "index" });

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
  ctx.postMessage(response);
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
  ctx.postMessage(response);
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
  ctx.postMessage(response);
}

function messageDispatch(message: MessageEvent<any>) {
  const kind: NSIndexWorker.IndexRequestMessageKind | undefined =
    message.data.kind;

  if (!kind) {
    return;
  }
  switch (kind) {
    case NSIndexWorker.IndexRequestMessageKind.startIndexing:
      return handleIndexRequest(message);
    case NSIndexWorker.IndexRequestMessageKind.startQuery:
      return handleQueryRequest(message);
    case NSIndexWorker.IndexRequestMessageKind.startInit:
      return handleStartInitRequest(message);
    default:
      assertNever(kind);
  }
}

ctx.addEventListener("message", messageDispatch);
