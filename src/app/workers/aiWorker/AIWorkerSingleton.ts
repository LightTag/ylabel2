import WorkerSingletonBase from "app/workers/common/BaseWorker";
import Worker from "worker-loader!./ai.worker";
import NSAIWorker from "app/workers/aiWorker/aiWorkerTypes";
import { GenericWorkerTypes } from "app/workers/common/datatypes";
import ERquestOrResponesOrUpdate = GenericWorkerTypes.ERquestOrResponesOrUpdate;
import AIRequestMessageKind = NSAIWorker.AIRequestMessageKind;
import EWorkerName = GenericWorkerTypes.EWorkerName;

class AIWorkerSingleton extends WorkerSingletonBase {
  workerName: EWorkerName.ai;
  training: boolean;

  private constructor() {
    super(new Worker());
    this.workerName = EWorkerName.ai;
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
      direction: ERquestOrResponesOrUpdate.request,
      kind: AIRequestMessageKind.startVectorize,
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
      direction: ERquestOrResponesOrUpdate.request,
      kind: AIRequestMessageKind.startValidation,
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
      direction: ERquestOrResponesOrUpdate.request,
      kind: AIRequestMessageKind.startFitPredict,
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
    await this.beginValidation();
    this.training = false;
  }
}

export default AIWorkerSingleton;
