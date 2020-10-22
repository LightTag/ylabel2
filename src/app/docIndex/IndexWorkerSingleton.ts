import { IndexWorker } from "app/docIndex/indextypes";
import Worker from "worker-loader!./ndx.worker";
import Data from "app/data_clients/datainterfaces";
import RequestMessageKind = IndexWorker.RequestMessageKind;

export class IndexWorkerSingleton /*implements IndexWorker.IWorkerController*/ {
  private static instance: IndexWorkerSingleton;
  private initialized: boolean;
  private worker;
  private requestId: number;
  private responseListeners: Record<string, (evt: MessageEvent) => void>;
  private constructor() {
    this.initialized = false;
    this.worker = new Worker();
    this.requestId = 0;
    this.responseListeners = {};
  }
  public static getInstance() {
    if (IndexWorkerSingleton.instance === undefined) {
      IndexWorkerSingleton.instance = new IndexWorkerSingleton();
    }
    return IndexWorkerSingleton.instance;
  }
  private nextRequestId() {
    this.requestId++;
    return this.requestId;
  }
  private registerResponseHandler<T extends IndexWorker.Response.TResponse>(
    requestId: number
  ): Promise<T["payload"]> {
    return new Promise((resolve) => {
      const responseHandler = (event: MessageEvent<T>) => {
        if (event.data.kind && event.data.requestId === requestId) {
          this.worker.removeEventListener(
            "message",
            this.responseListeners[requestId]
          );
          delete this.responseListeners[requestId];
          resolve(event.data.payload);
        }
      };
      this.responseListeners[requestId] = responseHandler;
      this.worker.addEventListener("message", responseHandler);
    });
  }
  public initializeIndex(indexName?: string) {
    const requestId = this.nextRequestId();
    const message: IndexWorker.Request.IStartInit = {
      requestId,
      kind: RequestMessageKind.startInit,
      payload: {
        indexName,
      },
    };
    this.worker.postMessage(message);
    return this.registerResponseHandler<IndexWorker.Response.IEndInit>(
      requestId
    ).then((response) => {
      this.initialized = true;
      return response;
    });
  }
  public addDocs(examples: Data.Example[]) {
    if (!this.initialized) {
      throw new Error("The index is not initialized yet");
    }
    const requestId = this.nextRequestId();

    const message: IndexWorker.Request.IStartIndex = {
      kind: IndexWorker.RequestMessageKind.startIndexing,
      requestId,
      payload: {
        examples,
      },
    };
    this.worker.postMessage(message);
    return this.registerResponseHandler<IndexWorker.Response.IEndIndex>(
      requestId
    );
  }
  public query(query: string) {
    if (!this.initialized) {
      throw new Error("The index is not initialized yet");
    }
    const requestId = this.nextRequestId();
    const message: IndexWorker.Request.IStartQuery = {
      kind: IndexWorker.RequestMessageKind.startQuery,
      requestId,
      payload: {
        query,
      },
    };
    this.worker.postMessage(message);
    return this.registerResponseHandler<IndexWorker.Response.IEndQuery>(
      requestId
    );
  }
}
