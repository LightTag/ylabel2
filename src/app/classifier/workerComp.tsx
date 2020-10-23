import React, { FunctionComponent } from "react";
import { IndexWorkerSingleton } from "app/workers/docIndex/IndexWorkerSingleton";
import Button from "@material-ui/core/Button";
import AIWorkerSingleton from "app/workers/aiWorker/AIWorkerSingleton";
import { Fade } from "@material-ui/core";
import LinearProgress from "@material-ui/core/LinearProgress";

const aiWorkerSingleton = AIWorkerSingleton.getInstance();
IndexWorkerSingleton;
const WorkComp: FunctionComponent = () => {
  const [working, setWorking] = React.useState<boolean>(false);
  const calculateTFIDF = async () => {
    setWorking(true);
    await aiWorkerSingleton.beginTfidfVectorizer();
    setWorking(false);
  };
  const vectorize = async () => {
    setWorking(true);
    await aiWorkerSingleton.beginUniversalVectorizer();
    setWorking(false);
  };
  const trainSVM = async () => {
    setWorking(true);
    await aiWorkerSingleton.beginFitPredict();
    await setWorking(false);
  };

  const validateModel = async () => {
    setWorking(true);
    await aiWorkerSingleton.beginValidation();
    setWorking(false);
  };

  return (
    <>
      <Button disabled={working} onClick={calculateTFIDF}>
        Calculate TFIDF
      </Button>
      <Button disabled={working} onClick={vectorize}>
        Vectorize
      </Button>
      <Button disabled={working} onClick={trainSVM}>
        Train SVM
      </Button>
      <Button disabled={working} onClick={validateModel} color={"primary"}>
        Val
      </Button>
      <Fade in={working}>
        <LinearProgress variant={"indeterminate"} />
      </Fade>
    </>
  );
};

export default WorkComp;
