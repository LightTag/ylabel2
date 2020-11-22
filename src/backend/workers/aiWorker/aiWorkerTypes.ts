import { GenericWorkerTypes } from "../common/datatypes";

namespace NSAIWorker {
  export enum AIRequestMessageKind {
    startVectorize = "startVectorize",
    startFitPredict = "startFitPredict",
    startValidation = "startValidation",
  }

  export enum AIResponseMessageKind {
    endVectorize = "endVectorize",
    endFitPredict = "endFitPredict",
    endValidation = "endValidation",
  }

  export enum AIUpdateMessageKind {
    updateVectorize = "updateVectorize",
    updateFitPredict = "updateFitPredict",
    updateValidation = "updateValidation",
  }

  interface AIEventBase extends GenericWorkerTypes.GenericEvent {
    workerName: GenericWorkerTypes.EWorkerName.ai;
    requestId: number;
    payload: unknown;
  }

  type RequestEvent = AIEventBase &
    GenericWorkerTypes.RequestEvent & {
      direction: GenericWorkerTypes.ERquestOrResponesOrUpdate.request;
    };
  type ResponseEvent = AIEventBase &
    GenericWorkerTypes.ResponseEvent & {
      direction: GenericWorkerTypes.ERquestOrResponesOrUpdate.response;
    };

  type UpdateEvent = AIEventBase &
    GenericWorkerTypes.UpdateEvent & {
      direction: GenericWorkerTypes.ERquestOrResponesOrUpdate.update;
      kind: AIUpdateMessageKind;
    };

  export namespace Request {
    export interface IStartVectorize extends RequestEvent {
      kind: AIRequestMessageKind.startVectorize;
      payload: {
        method: "tfidf" | "universalSentenceEncoder";
      };
    }

    export interface IStartValidate extends RequestEvent {
      kind: AIRequestMessageKind.startValidation;
      payload: {};
    }

    export interface IStartFitPredict extends RequestEvent {
      kind: AIRequestMessageKind.startFitPredict;
      payload: {};
    }
    export type AIWorkerRequests =
      | IStartFitPredict
      | IStartValidate
      | IStartVectorize;
  }

  export namespace Response {
    export interface IEndVectorize extends ResponseEvent {
      kind: AIResponseMessageKind.endVectorize;
      payload: {};
    }

    export interface IEndValidate extends ResponseEvent {
      kind: AIResponseMessageKind.endValidation;
      payload: {};
    }

    export interface IEndFitPredict extends ResponseEvent {
      kind: AIResponseMessageKind.endFitPredict;
      payload: {};
    }
    export type Responses = IEndVectorize | IEndValidate | IEndFitPredict;
  }
  export namespace Update {
    interface UpdatePayload {
      total: number;
      done: number;
      remaining: number;
      pctRemaining: number;
    }
    export interface IEndVectorize extends UpdateEvent {
      kind: AIUpdateMessageKind.updateVectorize;
      payload: UpdatePayload;
    }

    export interface IUpdateValidate extends UpdateEvent {
      kind: AIUpdateMessageKind.updateValidation;
      payload: UpdatePayload;
    }

    export interface IUpdateFirPredict extends UpdateEvent {
      kind: AIUpdateMessageKind.updateFitPredict;
      payload: UpdatePayload;
    }
  }
}

export default NSAIWorker;
