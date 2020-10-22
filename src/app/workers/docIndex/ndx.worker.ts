import createDocumentIndex, {
  IIndexAPI,
} from "app/workers/docIndex/indexBuilder";
import { IndexWorker } from "app/workers/docIndex/indextypes";
import { assertNever } from "../../../typing/utils";
import { decode, encode } from "@msgpack/msgpack";

import { Index } from "ndx";
import {
  toSerializable,
  fromSerializable,
  SerializableIndex,
} from "ndx-serializable";

import ResponseKinds = IndexWorker.IndexResponseMessageKind;
import ResponseMessageKind = IndexWorker.IndexResponseMessageKind;
import { workerDB } from "app/database/database";
import Data from "app/data_clients/datainterfaces";
import { GenericWorkerTypes } from "app/workers/common/datatypes";

interface WorkerWithIndex extends Worker {
  //TODO indicate that the index is possibly udnefined and check / send error messages
  index: IIndexAPI;
}
let ctx: WorkerWithIndex = self as any;

function handleIndexRequest(
  message: MessageEvent<IndexWorker.Request.IStartIndex>
) {
  const examples = message.data.payload.examples;
  examples.forEach((ex) => ctx.index.add(ex));
  const serializedIndex: Uint8Array = encode(toSerializable(ctx.index._index));

  workerDB.indexCache.add({ data: serializedIndex, name: "index" });

  console.log("Saved the index to disk");
  const response: IndexWorker.Response.IEndIndex = {
    worker: GenericWorkerTypes.EWorkerName.index,
    direction: GenericWorkerTypes.ERquestOrResponesOrUpdate.response,

    requestId: message.data.requestId,
    kind: ResponseKinds.endIndexing,
    payload: {
      numInserted: examples.length,
    },
  };
  ctx.postMessage(response);
}

function handleQueryRequest(
  message: MessageEvent<IndexWorker.Request.IStartQuery>
) {
  const queryString = message.data.payload.query;
  const results: IndexWorker.SearchResult[] = ctx.index
    .search(queryString)
    .map((res) => ({
      exampleId: res.key,
      score: res.score,
    }));
  const response: IndexWorker.Response.IEndQuery = {
    worker: GenericWorkerTypes.EWorkerName.index,
    direction: GenericWorkerTypes.ERquestOrResponesOrUpdate.response,
    kind: ResponseKinds.endQuery,
    requestId: message.data.requestId,
    payload: {
      results,
    },
  };
  ctx.postMessage(response);
}

async function handleStartInitRequest(
  message: MessageEvent<IndexWorker.Request.IStartInit>
) {
  const indexName = message.data.payload.indexName || "index"; //The default name
  const serializedIndex:
    | Data.SerializedIndex
    | undefined = await workerDB.indexCache.get(indexName);
  let loadedFromCache = false;
  if (serializedIndex) {
    console.log("Found a serialized index");
    const _index = fromSerializable(
      decode(serializedIndex.data) as SerializableIndex<string>
    ) as Index<string>;
    if (_index) {
      ctx;
      //Possibly returns undefined, not sure why.
      ctx.index = createDocumentIndex(["content"], _index);
      loadedFromCache = true;
    } else {
      console.log("Found a serialized index but it wouldnt pasrse");
    }
  }
  if (!loadedFromCache) {
    console.log("Starting New Index");
    ctx.index = createDocumentIndex(["content"]);
    console.log("Done New Index");
  }

  const response: IndexWorker.Response.IEndInit = {
    worker: GenericWorkerTypes.EWorkerName.index,
    direction: GenericWorkerTypes.ERquestOrResponesOrUpdate.response,

    requestId: message.data.requestId,
    kind: ResponseMessageKind.endInit,
    payload: {
      numIndexed: ctx.index._index.docs.size,
    },
  };
  ctx.postMessage(response);
}

function messageDispatch(message: MessageEvent<any>) {
  const kind: IndexWorker.IndexRequestMessageKind | undefined =
    message.data.kind;

  if (!kind) {
    return;
  }
  switch (kind) {
    case IndexWorker.IndexRequestMessageKind.startIndexing:
      return handleIndexRequest(message);
    case IndexWorker.IndexRequestMessageKind.startQuery:
      return handleQueryRequest(message);
    case IndexWorker.IndexRequestMessageKind.startInit:
      return handleStartInitRequest(message);
    default:
      assertNever(kind);
  }
}
ctx.addEventListener("message", messageDispatch);
