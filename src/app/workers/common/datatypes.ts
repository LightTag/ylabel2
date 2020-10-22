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
    payload: unknown;
  }

  export interface RequestEvent extends GenericEvent {
    direction: ERquestOrResponesOrUpdate.request;
  }

  export interface ResponseEvent extends GenericEvent {
    direction: ERquestOrResponesOrUpdate.response;
  }

  export interface UpdateEvent extends GenericEvent {
    direction: ERquestOrResponesOrUpdate.update;
  }

  export interface IWorkerSingleton {
    initialized: boolean;
    worker: any;
    requestId: number;
    responseListeners: Record<string, (evt: MessageEvent) => void>;

    nextRequestId(): any;

    registerResponseHandler<T extends ResponseEvent>(
      requestId: number
    ): Promise<T["payload"]>;
  }
}
