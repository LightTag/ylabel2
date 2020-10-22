import { IndexWorker } from "app/docIndex/indextypes";

class ModelWorkerControler<T> {
  isWorking: boolean;
  isFree: boolean;

  private static nextRequestId() {
    ModelWorkerControler.requestId++;
    return ModelWorkerControler.requestId;
  }
  private static registerResponseHandler<
    T extends IndexWorker.Response.TResponse
  >(requestId: number): Promise<T["payload"]> {
    return new Promise((resolve) => {
      const responseHandler = (event: MessageEvent<T>) => {
        if (event.data.kind && event.data.requestId === requestId) {
          ModelWorkerControler.worker.removeEventListener(
            "message",
            ModelWorkerControler.responseListeners[requestId]
          );
          delete ModelWorkerControler.responseListeners[requestId];
          resolve(event.data.payload);
        }
      };
      ModelWorkerControler.responseListeners[requestId] = responseHandler;
      ModelWorkerControler.worker.addEventListener("message", responseHandler);
    });
  }
}
