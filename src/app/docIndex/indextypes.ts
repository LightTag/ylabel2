import Data from "app/data_clients/datainterfaces";

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

  type EventBase<T extends RequestMessageKind | ResponseMessageKind> = {
    requestId: number;
    kind: T;
    payload: unknown;
  };
  type RequestEvent = EventBase<RequestMessageKind>;
  type ResponseEvent = EventBase<ResponseMessageKind>;
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
  export interface IWorkerController {
    addDocs: (docs: Data.Example[]) => Promise<{ numInserted: number }>;
    query: (query: string) => Promise<{ results: SearchResult[] }>;
    init: (indexName?: string) => Promise<{ numIndexed: number }>;
    addLabel?: (exampleId: string, label: string) => Promise<boolean>;
    saveToDisk?: () => void;
  }
}
