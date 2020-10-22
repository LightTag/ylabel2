import { GenericWorkerTypes, IndexWorker } from "app/docIndex/indextypes";
import Worker from "worker-loader!./ndx.worker";
import Data from "app/data_clients/datainterfaces";
import RequestMessageKind = IndexWorker.RequestMessageKind;
import IIndexSingelton = IndexWorker.IIndexSingelton;
import EWorkerName = GenericWorkerTypes.EWorkerName;
import ERquestOrResponesOrUpdate = GenericWorkerTypes.ERquestOrResponesOrUpdate;

abstract class WorkerSingletonBase {
  protected static instance: IndexWorkerSingleton;
  initialized: boolean;
  requestId: number;
  responseListeners: Record<string, (evt: MessageEvent) => void>;
  worker: Worker;
  constructor(workerInstance: any) {
    this.initialized = false;
    this.requestId = 0;
    this.responseListeners = {};
    this.worker = workerInstance;
  }
  registerResponseHandler<T extends IndexWorker.Response.TResponse>(
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
}

export class IndexWorkerSingleton
  extends WorkerSingletonBase
  implements IIndexSingelton {
  private constructor() {
    super(new Worker());
  }
  public static getInstance() {
    if (IndexWorkerSingleton.instance === undefined) {
      IndexWorkerSingleton.instance = new IndexWorkerSingleton();
    }
    return IndexWorkerSingleton.instance;
  }

  nextRequestId() {
    this.requestId++;
    return this.requestId;
  }

  registerResponseHandler<T extends IndexWorker.Response.TResponse>(
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
      worker: EWorkerName.index,
      direction: ERquestOrResponesOrUpdate.request,
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
      worker: EWorkerName.index,
      direction: ERquestOrResponesOrUpdate.request,

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
      worker: GenericWorkerTypes.EWorkerName.index,
      direction: GenericWorkerTypes.ERquestOrResponesOrUpdate.request,
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
