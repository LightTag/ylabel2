import createDocumentIndex from "app/docIndex/indexBuilder";
import { IndexWorker } from "app/docIndex/indextypes";
import { assertNever } from "../../typing/utils";
import MessageKind = IndexWorker.MessageKind;

const ctx: Worker = self as any;
const index = createDocumentIndex(["content"]);

function handleIndexRequest(
  message: MessageEvent<IndexWorker.Request.IStartIndex>
) {
  const examples = message.data.payload.examples;
  examples.forEach((ex) => index.add(ex));
  const response: IndexWorker.Response.IEndIndex = {
    requestId: message.data.requestId,
    kind: MessageKind.endIndexing,
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
  const results: IndexWorker.SearchResult[] = index
    .search(queryString)
    .map((res) => ({
      exampleId: res.key,
      score: res.score,
    }));
  const response: IndexWorker.Response.IEndQuery = {
    kind: MessageKind.endQuery,
    requestId: message.data.requestId,
    payload: {
      results,
    },
  };
  ctx.postMessage(response);
}

function messageDispatch(message: MessageEvent<any>) {
  const kind: IndexWorker.MessageKind | undefined = message.data.kind;

  if (!kind) {
    return;
  }
  switch (kind) {
    case IndexWorker.MessageKind.startIndexing:
      return handleIndexRequest(message);
      break;
    case IndexWorker.MessageKind.startQuery:
      return handleQueryRequest(message);
      break;
    case IndexWorker.MessageKind.endIndexing:
    case IndexWorker.MessageKind.endQuery:
      return;
    default:
      assertNever(kind);
  }
}
ctx.addEventListener("message", messageDispatch);
