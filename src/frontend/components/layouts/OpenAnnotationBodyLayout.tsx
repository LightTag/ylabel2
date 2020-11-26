import React, { FunctionComponent } from "react";
import TwoColumnBody from "./templates/TwoColumnBody";
import LabelControls from "../labelControls/labelControls";
import useSpanRegistry from "../../utils/spanRegistry/useSpanRegistry";
import useSearchQuery from "../../QueryContext/useSearchQuery";
import ActiveLearningContextProvider from "../../active_learning/ActiveLearningContext";
import ActiveLearningBody from "../../active_learning/ActiveLearningBody";
import Example from "../example/Example";
import { useTypedSelector } from "../../redux-state/rootState";
const RegularBody: FunctionComponent = () => {
  const spanRegistry = useSpanRegistry();
  const exampleIds = useSearchQuery();
  const data = exampleIds.data || [];
  return (
    <>
      {data.slice(0, 10).map((ex) => (
        <Example
          key={ex}
          score={1}
          exampleId={ex}
          addSpanId={spanRegistry.addSpanId}
        />
      ))}
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
  return <TwoColumnBody Left={<LabelControls />} Right={<BodyDispatch />} />;
};

export default OpenAnnotationBody;
