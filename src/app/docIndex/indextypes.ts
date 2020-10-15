import Data from "app/data_clients/datainterfaces";

export namespace IndexWorker {
  export const enum MessageKind {
    startIndexing = "startIndexing",
    endIndexing = "endIndexing",
    startQuery = "startQuery",
    endQuery = "endQuery",
  }
  export type EventBase = {
    requestId: number;
    kind: MessageKind;
    payload: unknown;
  };
  export type SearchResult = {
    exampleId: string;
    score: number;
  };
  export namespace Request {
    export interface IStartIndex extends EventBase {
      kind: MessageKind.startIndexing;
      payload: {
        examples: Data.Example[];
      };
    }
    export interface IStartQuery extends EventBase {
      kind: MessageKind.startQuery;
      payload: {
        query: string;
      };
    }
  }
  export namespace Response {
    export interface IEndIndex extends EventBase {
      kind: MessageKind.endIndexing;
      payload: {
        numInserted: number;
      };
    }
    export interface IEndQuery extends EventBase {
      kind: MessageKind.endQuery;
      payload: {
        results: SearchResult[];
      };
    }
  }
  export interface IWorkerController {
    addDocs: (docs: Data.Example[]) => Promise<{ numInserted: number }>;
    query: (query: string) => Promise<{ results: SearchResult[] }>;
    addLabel?: (exampleId: string, label: string) => Promise<boolean>;
    saveToDisk?: () => void;
  }
}
