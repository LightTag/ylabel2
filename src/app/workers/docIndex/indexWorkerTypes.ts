import Data from "app/data_clients/datainterfaces";
import { GenericWorkerTypes } from "app/workers/common/datatypes";

export namespace NSIndexWorker {
  export const enum IndexRequestMessageKind {
    startIndexing = "startIndexing",
    startQuery = "startQuery",
    startInit = "startInit",
  }
  export const enum IndexResponseMessageKind {
    endIndexing = "endIndexing",
    endQuery = "endQuery",
    endInit = "endInit",
  }

  interface IndexEventBase extends GenericWorkerTypes.GenericEvent {
    workerName: GenericWorkerTypes.EWorkerName.index;
    requestId: number;
    payload: unknown;
  }
  type RequestEvent = IndexEventBase &
    GenericWorkerTypes.RequestEvent & {
      direction: GenericWorkerTypes.ERquestOrResponesOrUpdate.request;
      kind: IndexRequestMessageKind;
    };
  type ResponseEvent = IndexEventBase &
    GenericWorkerTypes.ResponseEvent & {
      direction: GenericWorkerTypes.ERquestOrResponesOrUpdate.response;
      kind: IndexResponseMessageKind;
    };
  export type SearchResult = {
    exampleId: string;
    score: number;
  };
  export namespace Request {
    export interface IStartIndex extends RequestEvent {
      kind: IndexRequestMessageKind.startIndexing;
      payload: {
        examples: Data.Example[];
      };
    }
    export interface IStartQuery extends RequestEvent {
      kind: IndexRequestMessageKind.startQuery;
      payload: {
        query: string;
      };
    }
    export interface IStartInit extends RequestEvent {
      kind: IndexRequestMessageKind.startInit;
      payload: {
        indexName?: string;
      };
    }
    export type TRequests = IStartQuery | IStartIndex | IStartInit;
  }
  export namespace Response {
    export interface IEndIndex extends ResponseEvent {
      kind: IndexResponseMessageKind.endIndexing;
      payload: {
        numInserted: number;
      };
    }
    export interface IEndQuery extends ResponseEvent {
      kind: IndexResponseMessageKind.endQuery;
      payload: {
        results: SearchResult[];
      };
    }
    export interface IEndInit extends ResponseEvent {
      kind: IndexResponseMessageKind.endInit;
      payload: {
        numIndexed: number;
      };
    }
    export type TResponse = IEndQuery | IEndIndex | IEndInit;
  }

  export interface IIndexSingelton {
    addDocs: (docs: Data.Example[]) => Promise<{ numInserted: number }>;
    query: (query: string) => Promise<{ results: SearchResult[] }>;
    initializeIndex: (indexName?: string) => Promise<{ numIndexed: number }>;
    addLabel?: (exampleId: string, label: string) => Promise<boolean>;
    saveToDisk?: () => void;
  }
}
