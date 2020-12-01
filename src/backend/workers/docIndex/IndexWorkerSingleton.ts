import { NSIndexWorker } from "./indexWorkerTypes";
import Worker from "worker-loader!./ndx_worker";
import Data from "../..//data_clients/datainterfaces";
import { GenericWorkerTypes } from "../common/datatypes";
import WorkerSingletonBase from "../..//workers/common/BaseWorker";
import logger from "../../utils/logger";

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
    const me = this;
    return this.registerResponseHandler<NSIndexWorker.Response.IEndInit>(
      requestId
    ).then((response) => {
      me.initialized = true;
      return response;
    });
  }

  public buildIndex() {
    const requestId = this.nextRequestId();
    const event: NSIndexWorker.Request.IStartIndex = {
      workerName: GenericWorkerTypes.EWorkerName.index,
      direction: GenericWorkerTypes.ERquestOrResponesOrUpdate.request,
      requestId,
      kind: NSIndexWorker.IndexRequestMessageKind.startIndexing,
      payload: {},
    };

    this.startWork(event);
    return this.registerResponseHandler<NSIndexWorker.Response.IEndIndex>(
      requestId
    );
  }

  public addDocs(examples: Data.Example[]) {
    if (!this.initialized) {
      throw new Error("The index is not initialized yet");
    }
    const requestId = this.nextRequestId();

    const event: NSIndexWorker.Request.IStartDataInsert = {
      direction: GenericWorkerTypes.ERquestOrResponesOrUpdate.request,
      requestId: requestId,
      workerName: GenericWorkerTypes.EWorkerName.index,
      kind: NSIndexWorker.IndexRequestMessageKind.startDataInsert,
      payload: {
        examples: examples,
      },
    };

    this.startWork(event);
    return this.registerResponseHandler<NSIndexWorker.Response.IEndDataInsert>(
      requestId
    );
  }
  public async insertAndIndex(examples: Data.Example[]) {
    await this.addDocs(examples);
    return this.buildIndex();
  }
  public getSignificantTermsForLabel(labelName: string) {
    if (!this.initialized) {
      logger("Index wasn't initialized");
      return Promise.reject();
    }

    const requestId = this.nextRequestId();
    const message: NSIndexWorker.Request.IStartSignificantTerms = {
      workerName: GenericWorkerTypes.EWorkerName.index,
      direction: GenericWorkerTypes.ERquestOrResponesOrUpdate.request,

      kind: NSIndexWorker.IndexRequestMessageKind.startSignificantTerms,
      requestId,
      payload: {
        labelName,
      },
    };

    this.worker.postMessage(message);
    return this.registerResponseHandler<NSIndexWorker.Response.IEndSignificantTerms>(
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
