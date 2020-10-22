import Worker from "worker-loader!*";
import { NSIndexWorker } from "app/workers/docIndex/indexWorkerTypes";

abstract class WorkerSingletonBase {
  protected static instance: WorkerSingletonBase;
  initialized: boolean;
  protected requestId: number;
  protected responseListeners: Record<string, (evt: MessageEvent) => void>;
  protected worker: Worker;

  protected constructor(workerInstance: any) {
    this.initialized = false;
    this.requestId = 0;
    this.responseListeners = {};
    this.worker = workerInstance;
  }

  registerResponseHandler<T extends NSIndexWorker.Response.TResponse>(
    requestId: number
  ): Promise<T["payload"]> {
    return new Promise((resolve) => {
      const responseHandler = (event: MessageEvent<T>) => {
        if (event.data.kind && event.data.requestId === requestId) {
          this.worker.removeEventListener(
            "message",
            this.responseListeners[requestId]
          );
          delete this.responseListeners[requestId];
          resolve(event.data.payload);
        }
      };
      this.responseListeners[requestId] = responseHandler;
      this.worker.addEventListener("message", responseHandler);
    });
  }
}

export default WorkerSingletonBase;