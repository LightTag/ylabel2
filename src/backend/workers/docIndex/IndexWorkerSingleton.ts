import { NSIndexWorker } from "./indexWorkerTypes";
import Worker from "worker-loader!./ndx_worker";
import Data from "../..//data_clients/datainterfaces";
import { GenericWorkerTypes } from "../common/datatypes";
import WorkerSingletonBase from "../..//workers/common/BaseWorker";

export class IndexWorkerSingleton
  extends WorkerSingletonBase
  implements NSIndexWorker.IIndexSingelton {
  private constructor() {
    super(new Worker());
  }
  public static getInstance(): IndexWorkerSingleton {
    if (IndexWorkerSingleton.instance === undefined) {
      IndexWorkerSingleton.instance = new IndexWorkerSingleton();
    }
    return IndexWorkerSingleton.instance as IndexWorkerSingleton;
  }

  public initializeIndex(indexName?: string) {
    const requestId = this.nextRequestId();
    const message: NSIndexWorker.Request.IStartInit = {
      workerName: GenericWorkerTypes.EWorkerName.index,
      direction: GenericWorkerTypes.ERquestOrResponesOrUpdate.request,
      requestId,
      kind: NSIndexWorker.IndexRequestMessageKind.startInit,
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
      workerName: GenericWorkerTypes.EWorkerName.index,
      direction: GenericWorkerTypes.ERquestOrResponesOrUpdate.request,

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
      workerName: GenericWorkerTypes.EWorkerName.index,
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
