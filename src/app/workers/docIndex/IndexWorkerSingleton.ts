import { NSIndexWorker } from "app/workers/docIndex/indexWorkerTypes";
import Worker from "worker-loader!./ndx.worker";
import Data from "app/data_clients/datainterfaces";
import { GenericWorkerTypes } from "app/workers/common/datatypes";
import WorkerSingletonBase from "app/workers/common/BaseWorker";
import RequestMessageKind = NSIndexWorker.IndexRequestMessageKind;
import IIndexSingelton = NSIndexWorker.IIndexSingelton;
import EWorkerName = GenericWorkerTypes.EWorkerName;
import ERquestOrResponesOrUpdate = GenericWorkerTypes.ERquestOrResponesOrUpdate;

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

  registerResponseHandler<T extends NSIndexWorker.Response.TResponse>(
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
    const message: NSIndexWorker.Request.IStartInit = {
      worker: EWorkerName.index,
      direction: ERquestOrResponesOrUpdate.request,
      requestId,
      kind: RequestMessageKind.startInit,
      payload: {
        indexName,
      },
    };
    this.worker.postMessage(message);
    return this.registerResponseHandler<NSIndexWorker.Response.IEndInit>(
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

    const message: NSIndexWorker.Request.IStartIndex = {
      worker: EWorkerName.index,
      direction: ERquestOrResponesOrUpdate.request,

      kind: NSIndexWorker.IndexRequestMessageKind.startIndexing,
      requestId,
      payload: {
        examples,
      },
    };
    this.worker.postMessage(message);
    return this.registerResponseHandler<NSIndexWorker.Response.IEndIndex>(
      requestId
    );
  }
  public query(query: string) {
    if (!this.initialized) {
      throw new Error("The index is not initialized yet");
    }
    const requestId = this.nextRequestId();
    const message: NSIndexWorker.Request.IStartQuery = {
      worker: GenericWorkerTypes.EWorkerName.index,
      direction: GenericWorkerTypes.ERquestOrResponesOrUpdate.request,
      kind: NSIndexWorker.IndexRequestMessageKind.startQuery,
      requestId,
      payload: {
        query,
      },
    };
    this.worker.postMessage(message);
    return this.registerResponseHandler<NSIndexWorker.Response.IEndQuery>(
      requestId
    );
  }
}
