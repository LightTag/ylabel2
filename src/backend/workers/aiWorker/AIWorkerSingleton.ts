import WorkerSingletonBase from "../common/BaseWorker";
import Worker from "worker-loader!./ai_worker";
import NSAIWorker from "./aiWorkerTypes";
import { GenericWorkerTypes } from "../common/datatypes";

class AIWorkerSingleton extends WorkerSingletonBase {
  workerName: GenericWorkerTypes.EWorkerName.ai;
  training: boolean;

  private constructor() {
    super(new Worker());
    this.workerName = GenericWorkerTypes.EWorkerName.ai;
    this.training = false;
  }

  static getInstance(): AIWorkerSingleton {
    if (this.instance === undefined) {
      this.instance = new AIWorkerSingleton();
    }

    return this.instance as AIWorkerSingleton;
  }

  private beginVectorization(
    method: NSAIWorker.Request.IStartVectorize["payload"]["method"]
  ) {
    const event: NSAIWorker.Request.IStartVectorize = {
      workerName: this.workerName,
      direction: GenericWorkerTypes.ERquestOrResponesOrUpdate.request,
      kind: NSAIWorker.AIRequestMessageKind.startVectorize,
      payload: {
        method,
      },
      requestId: this.nextRequestId(),
    };
    this.worker.postMessage(event);
    return this.registerResponseHandler<NSAIWorker.Response.IEndVectorize>(
      event.requestId
    );
  }

  public beginUniversalVectorizer() {
    return this.beginVectorization("universalSentenceEncoder");
  }

  public beginTfidfVectorizer() {
    return this.beginVectorization("tfidf");
  }

  public beginValidation() {
    const event: NSAIWorker.Request.IStartValidate = {
      workerName: this.workerName,
      direction: GenericWorkerTypes.ERquestOrResponesOrUpdate.request,
      kind: NSAIWorker.AIRequestMessageKind.startValidation,
      payload: {},
      requestId: this.nextRequestId(),
    };
    this.worker.postMessage(event);
    return this.registerResponseHandler<NSAIWorker.Response.IEndVectorize>(
      event.requestId
    );
  }

  public beginFitPredict() {
    const event: NSAIWorker.Request.IStartFitPredict = {
      workerName: this.workerName,
      direction: GenericWorkerTypes.ERquestOrResponesOrUpdate.request,
      kind: NSAIWorker.AIRequestMessageKind.startFitPredict,
      payload: {},
      requestId: this.nextRequestId(),
    };
    this.worker.postMessage(event);
    return this.registerResponseHandler<NSAIWorker.Response.IEndVectorize>(
      event.requestId
    );
  }

  public async afterNewLabel() {
    if (this.training) {
      return;
    }
    this.training = true;
    await this.beginFitPredict();
    // await this.beginValidation();
    this.training = false;
  }
}

export default AIWorkerSingleton;
