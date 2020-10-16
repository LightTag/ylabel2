import { IndexWorker } from "app/docIndex/indextypes";
import Worker from "worker-loader!./ndx.worker";
import Data from "app/data_clients/datainterfaces";
import RequestMessageKind = IndexWorker.RequestMessageKind;

export class IndexWorkerController /*implements IndexWorker.IWorkerController*/ {
  private static initialized: boolean = false;
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
  private static registerResponseHandler<
    T extends IndexWorker.Response.TResponse
  >(requestId: number): Promise<T["payload"]> {
    return new Promise((resolve) => {
      const responseHandler = (event: MessageEvent<T>) => {
        if (event.data.kind && event.data.requestId === requestId) {
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
  public static initializeIndex(indexName?: string) {
    const requestId = IndexWorkerController.nextRequestId();
    const message: IndexWorker.Request.IStartInit = {
      requestId,
      kind: RequestMessageKind.startInit,
      payload: {
        indexName,
      },
    };
    IndexWorkerController.worker.postMessage(message);
    return IndexWorkerController.registerResponseHandler<
      IndexWorker.Response.IEndInit
    >(requestId).then((response) => {
      IndexWorkerController.initialized = true;
      return response;
    });
  }
  public static addDocs(examples: Data.Example[]) {
    if (!IndexWorkerController.initialized) {
      throw new Error("The index is not initialized yet");
    }
    const requestId = IndexWorkerController.nextRequestId();

    const message: IndexWorker.Request.IStartIndex = {
      kind: IndexWorker.RequestMessageKind.startIndexing,
      requestId,
      payload: {
        examples,
      },
    };
    IndexWorkerController.worker.postMessage(message);
    return IndexWorkerController.registerResponseHandler<
      IndexWorker.Response.IEndIndex
    >(requestId);
  }
  public static query(query: string) {
    if (!IndexWorkerController.initialized) {
      throw new Error("The index is not initialized yet");
    }
    const requestId = IndexWorkerController.nextRequestId();
    const message: IndexWorker.Request.IStartQuery = {
      kind: IndexWorker.RequestMessageKind.startQuery,
      requestId,
      payload: {
        query,
      },
    };
    IndexWorkerController.worker.postMessage(message);
    return IndexWorkerController.registerResponseHandler<
      IndexWorker.Response.IEndQuery
    >(requestId);
  }
}
