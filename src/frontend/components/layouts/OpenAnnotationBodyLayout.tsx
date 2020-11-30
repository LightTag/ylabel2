import React, { FunctionComponent } from "react";
import ThreeColumnBody from "./templates/ThreeColumnBody";
import LabelControls from "../labelControls/labelControls";
import useSearchQuery from "../../QueryContext/useSearchQuery";
import ActiveLearningContextProvider from "../../active_learning/ActiveLearningContext";
import ActiveLearningBody from "../../active_learning/ActiveLearningBody";
import { useTypedSelector } from "../../redux-state/rootState";
import { Fade } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import WorkComp from "../../classifier/workerComp";
import ExampleInfiniteScroll from "./ExampleInfiniteScroll";
import { AddDataDialogWithButton } from "../dataUpload/AddDataDialog";

const NoDataBody = () => {
  return (
    <div style={{ width: "400px", margin: "auto" }}>
      <Typography variant={"h3"} gutterBottom>
        No Results
      </Typography>
      <Typography variant={"h5"} gutterBottom>
        We searched hard, but the current query doesn't have any matches
      </Typography>
    </div>
  );
};

const RegularBody: FunctionComponent = () => {
  const exampleIds = useSearchQuery();
  const data = exampleIds.data || [];

  return (
    <>
      <Fade in={exampleIds.isLoading}>
        <div>Loading</div>
      </Fade>
      <Fade
        in={exampleIds.isSuccess && data.length > 0}
        mountOnEnter
        unmountOnExit
      >
        <ExampleInfiniteScroll exampleIds={data} />
      </Fade>
      <Fade
        in={exampleIds.isSuccess && data.length === 0}
        mountOnEnter
        unmountOnExit
      >
        <NoDataBody />
      </Fade>
    </>
  );
};
const BodyDispatch: FunctionComponent = () => {
  const mode = useTypedSelector((state) => state.appMode.mode);
  const isActiveLearning = mode === "ActiveLearning";

  return (
    <div
      style={{
        height: "100%",
        padding: "2rem",
        maxHeight: "100%",
        overflowY: "auto",
      }}
    >
      {isActiveLearning ? (
        <ActiveLearningContextProvider>
          <ActiveLearningBody />
        </ActiveLearningContextProvider>
      ) : (
        <RegularBody />
      )}
    </div>
  );
};
const OpenAnnotationBody: FunctionComponent = () => {
  return (
    <ThreeColumnBody
      Left={<LabelControls />}
      Middle={<BodyDispatch />}
      Right={
        <div>
          <WorkComp />{" "}
          <AddDataDialogWithButton
            label={"Add Data"}
            buttonProps={{ variant: "contained", color: "primary" }}
          />
        </div>
      }
    />
  );
};

export default OpenAnnotationBody;
