import React from "react";
import { FunctionComponent } from "react";
import Worker from "worker-loader!./test.worker";

import { Typography } from "@material-ui/core";
import { useTypedSelector } from "app/redux-state/rootState";
import { selectExampleIds } from "app/redux-state/examples/exampleSelectors";
import { EventKinds, TFIDFEvent } from "app/classifier/test.worker";
import { IndexWorkerController } from "app/docIndex/IndexWorkerController";
const worker = new Worker();
IndexWorkerController;
const WorkComp: FunctionComponent = () => {
  const exampleIds = useTypedSelector(selectExampleIds);

  React.useEffect(() => {
    const event: TFIDFEvent = {
      kind: EventKinds.tfidf,
      payload: {
        exampleIds: exampleIds as string[],
      },
    };
    worker.postMessage(event);
  }, [exampleIds]);
  return <Typography>Hi</Typography>;
};

export default WorkComp;
