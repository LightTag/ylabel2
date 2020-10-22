import React, { FunctionComponent } from "react";
import Worker from "worker-loader!../workers/aiWorker/ai.worker";
import { useTypedSelector } from "app/redux-state/rootState";
import { selectExampleIds } from "app/redux-state/examples/exampleSelectors";
import {
  EventKinds,
  TFIDFEvent,
  TrainSVMEvent,
  ValidateModelEvent,
  VecotizeEvent,
} from "app/workers/aiWorker/ai.worker";
import { IndexWorkerSingleton } from "app/workers/docIndex/IndexWorkerSingleton";
import Button from "@material-ui/core/Button";

const worker = new Worker();
IndexWorkerSingleton;
const WorkComp: FunctionComponent = () => {
  const exampleIds = useTypedSelector(selectExampleIds);
  const calculateTFIDF = () => {
    const event: TFIDFEvent = {
      kind: EventKinds.tfidf,
      payload: {
        exampleIds: exampleIds as string[],
      },
    };
    worker.postMessage(event);
  };
  const vectorize = () => {
    const event: VecotizeEvent = {
      kind: EventKinds.vectorize,
      payload: {},
    };
    worker.postMessage(event);
  };
  const trainSVM = () => {
    const event: TrainSVMEvent = {
      kind: EventKinds.trainSVM,
      payload: {},
    };
    worker.postMessage(event);
  };

  const validateModel = () => {
    const event: ValidateModelEvent = {
      kind: EventKinds.validateModel,
      payload: {},
    };
    worker.postMessage(event);
  };

  return (
    <>
      <Button onClick={calculateTFIDF}>Calculate TFIDF</Button>
      <Button onClick={vectorize}>Vectorize</Button>
      <Button onClick={trainSVM}>Train SVM</Button>
      <Button onClick={validateModel} color={"primary"}>
        Val
      </Button>
    </>
  );
};

export default WorkComp;
