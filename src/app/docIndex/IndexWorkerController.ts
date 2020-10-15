import { IndexWorker } from "app/docIndex/indextypes";
import Worker from "worker-loader!./ndx.worker";
import Data from "app/data_clients/datainterfaces";

export class IndexWorkerController /*implements IndexWorker.IWorkerController*/ {
  private static worker = new Worker();
  private static requestId: number = 0;
  private static responseListeners: Record<
    string,
    (evt: MessageEvent) => void
  > = {};
  private static nextRequestId() {
    IndexWorkerController.requestId++;
    return IndexWorkerController.requestId;
  }
  public static addDocs(examples: Data.Example[]) {
    const requestId = IndexWorkerController.nextRequestId();
    debugger;
    const message: IndexWorker.Request.IStartIndex = {
      kind: IndexWorker.MessageKind.startIndexing,
      requestId,
      payload: {
        examples,
      },
    };
    IndexWorkerController.worker.postMessage(message);

    return new Promise<{ numInserted: number }>((resolve) => {
      const responseHandler = (
        event: MessageEvent<IndexWorker.Response.IEndIndex>
      ) => {
        debugger;
        if (
          event.data.kind === IndexWorker.MessageKind.endIndexing &&
          event.data.requestId === requestId
        ) {
          IndexWorkerController.worker.removeEventListener(
            "message",
            IndexWorkerController.responseListeners[requestId]
          );
          delete IndexWorkerController.responseListeners[requestId];
          resolve(event.data.payload);
        }
      };
      IndexWorkerController.responseListeners[requestId] = responseHandler;
      IndexWorkerController.worker.addEventListener("message", responseHandler);
    });
  }
  public static query(query: string) {
    const requestId = IndexWorkerController.nextRequestId();
    const message: IndexWorker.Request.IStartQuery = {
      kind: IndexWorker.MessageKind.startQuery,
      requestId,
      payload: {
        query,
      },
    };
    IndexWorkerController.worker.postMessage(message);
    return new Promise<{ results: IndexWorker.SearchResult[] }>((resolve) => {
      const responseHandler = (
        workerMessage: MessageEvent<IndexWorker.Response.IEndQuery>
      ) => {
        debugger;
        if (
          workerMessage.data.kind === IndexWorker.MessageKind.endQuery &&
          workerMessage.data.requestId === requestId
        ) {
          IndexWorkerController.worker.removeEventListener(
            "message",
            IndexWorkerController.responseListeners[requestId]
          );
          delete IndexWorkerController.responseListeners[requestId];
          resolve(workerMessage.data.payload);
        }
      };
      IndexWorkerController.responseListeners[requestId] = responseHandler;
      IndexWorkerController.worker.addEventListener("message", responseHandler);
    });
  }
}
