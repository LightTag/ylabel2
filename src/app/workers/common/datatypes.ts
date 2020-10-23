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
    workerName: EWorkerName;
    direction: ERquestOrResponesOrUpdate;
    payload: unknown;
    requestId: number;
    kind: unknown;
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
}
