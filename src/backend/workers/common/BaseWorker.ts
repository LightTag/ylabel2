import Worker from "worker-loader!*";
import { GenericWorkerTypes } from "./datatypes";
import logger from "../../utils/logger";

abstract class WorkerSingletonBase {
  protected static instance: WorkerSingletonBase;
  initialized: boolean;
  protected requestId: number;
  protected responseListeners: Record<string, (evt: MessageEvent) => void>;
  protected worker: Worker;
  protected jobCount: number;

  protected constructor(workerInstance: any) {
    this.initialized = false;
    this.requestId = 0;
    this.responseListeners = {};
    this.worker = workerInstance;
    this.jobCount = 0;
  }

  protected nextRequestId() {
    this.requestId++;
    return this.requestId;
  }
  protected startWork<T extends GenericWorkerTypes.RequestEvent>(event: T) {
    logger("Received requests", event);
    if (this.jobCount > 0) {
      logger(
        `Currently blocked with ${this.jobCount} jobs.  worker will queue`,
        event
      );
    }
    this.jobCount += 1;
    this.worker.postMessage(event);
  }
  registerResponseHandler<T extends GenericWorkerTypes.ResponseEvent>(
    requestId: number
  ): Promise<T["payload"]> {
    return new Promise((resolve) => {
      const responseHandler = (event: MessageEvent<T>) => {
        if (event.data.kind && event.data.requestId === requestId) {
          this.jobCount -= 1;
          logger(`Finished request ${requestId}. ${this.jobCount} remaining`);
          this.worker.removeEventListener(
            "message",
            this.responseListeners[requestId]
          );
          delete this.responseListeners[requestId];
          resolve(event.data.payload);
        } else {
          logger("Unhandled response", event.data);
        }
      };
      this.responseListeners[requestId] = responseHandler;
      this.worker.addEventListener("message", responseHandler);
    });
  }
}

export default WorkerSingletonBase;
