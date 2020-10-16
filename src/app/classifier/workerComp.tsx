import React, { FunctionComponent } from "react";
import Worker from "worker-loader!./test.worker";
import { useTypedSelector } from "app/redux-state/rootState";
import { selectExampleIds } from "app/redux-state/examples/exampleSelectors";
import {
  EventKinds,
  TFIDFEvent,
  TrainSVMEvent,
} from "app/classifier/test.worker";
import { IndexWorkerController } from "app/docIndex/IndexWorkerController";
import Button from "@material-ui/core/Button";

const worker = new Worker();
IndexWorkerController;
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
  const trainSVM = () => {
    const event: TrainSVMEvent = {
      kind: EventKinds.trainSVM,
      payload: {},
    };
    worker.postMessage(event);
  };

  return (
    <>
      <Button onClick={calculateTFIDF}>Calculate TFIDF</Button>
      <Button onClick={trainSVM}>Train SVM</Button>
    </>
  );
};

export default WorkComp;
