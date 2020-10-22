import Data from "app/data_clients/datainterfaces";
export namespace GenericWorkerTypes {
  export const enum EWorkerName {
    index = "index",
    dataLoader = "dataLoading",
    ai = "ai",
  }
  export const enum ERquestOrResponesOrUpdate {
    request = "request",
    response = "response",
    update = "update",
  }
  export interface GenericEvent {
    worker: EWorkerName;
    direction: ERquestOrResponesOrUpdate;
  }
}
export namespace IndexWorker {
  export const enum RequestMessageKind {
    startIndexing = "startIndexing",
    startQuery = "startQuery",
    startInit = "startInit",
  }
  export const enum ResponseMessageKind {
    endIndexing = "endIndexing",
    endQuery = "endQuery",
    endInit = "endInit",
  }

  interface EventBase<T extends RequestMessageKind | ResponseMessageKind>
    extends GenericWorkerTypes.GenericEvent {
    worker: GenericWorkerTypes.EWorkerName.index;
    direction: T extends RequestMessageKind
      ? GenericWorkerTypes.ERquestOrResponesOrUpdate.request
      : GenericWorkerTypes.ERquestOrResponesOrUpdate.response;
    requestId: number;
    kind: T;
    payload: unknown;
  }
  type RequestEvent = EventBase<RequestMessageKind> & {
    direction: GenericWorkerTypes.ERquestOrResponesOrUpdate.request;
  };
  type ResponseEvent = EventBase<ResponseMessageKind> & {
    direction: GenericWorkerTypes.ERquestOrResponesOrUpdate.response;
  };
  export type SearchResult = {
    exampleId: string;
    score: number;
  };
  export namespace Request {
    export interface IStartIndex extends RequestEvent {
      kind: RequestMessageKind.startIndexing;
      payload: {
        examples: Data.Example[];
      };
    }
    export interface IStartQuery extends RequestEvent {
      kind: RequestMessageKind.startQuery;
      payload: {
        query: string;
      };
    }
    export interface IStartInit extends RequestEvent {
      kind: RequestMessageKind.startInit;
      payload: {
        indexName?: string;
      };
    }
    export type TRequests = IStartQuery | IStartIndex | IStartInit;
  }
  export namespace Response {
    export interface IEndIndex extends ResponseEvent {
      kind: ResponseMessageKind.endIndexing;
      payload: {
        numInserted: number;
      };
    }
    export interface IEndQuery extends ResponseEvent {
      kind: ResponseMessageKind.endQuery;
      payload: {
        results: SearchResult[];
      };
    }
    export interface IEndInit extends ResponseEvent {
      kind: ResponseMessageKind.endInit;
      payload: {
        numIndexed: number;
      };
    }
    export type TResponse = IEndQuery | IEndIndex | IEndInit;
  }
  export interface IWorkerSingleton {
    initialized: boolean;
    worker: any;
    requestId: number;
    responseListeners: Record<string, (evt: MessageEvent) => void>;

    nextRequestId(): any;

    registerResponseHandler<T extends IndexWorker.Response.TResponse>(
      requestId: number
    ): Promise<T["payload"]>;
  }
  export interface IIndexSingelton extends IWorkerSingleton {
    addDocs: (docs: Data.Example[]) => Promise<{ numInserted: number }>;
    query: (query: string) => Promise<{ results: SearchResult[] }>;
    initializeIndex: (indexName?: string) => Promise<{ numIndexed: number }>;
    addLabel?: (exampleId: string, label: string) => Promise<boolean>;
    saveToDisk?: () => void;
  }
}
