import WorkerSingletonBase from "app/workers/common/BaseWorker";
import Worker from "worker-loader!./ai.worker";

class AIWorkerSingleton extends WorkerSingletonBase {
  private constructor() {
    super(new Worker());
  }
  static getInstance(): AIWorkerSingleton {
    if (this.instance === undefined) {
      this.instance = new AIWorkerSingleton();
    }

    return this.instance;
  }
  public beginVectorization() {
    const event;
  }
}

export default AIWorkerSingleton;
