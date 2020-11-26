import React, { FunctionComponent } from "react";
import TwoColumnBody from "./templates/TwoColumnBody";
import LabelControls from "../labelControls/labelControls";
import useSpanRegistry from "../../utils/spanRegistry/useSpanRegistry";
import useSearchQuery from "../../QueryContext/useSearchQuery";
import Switch from "@material-ui/core/Switch";
import ActiveLearningContextProvider from "../../active_learning/ActiveLearningContext";
import ActiveLearningBody from "../../active_learning/ActiveLearningBody";
import Example from "../example/Example";

const Body: FunctionComponent = () => {
  const spanRegistry = useSpanRegistry();

  const exampleIds = useSearchQuery();
  const [isAL, setIsAL] = React.useState<boolean>(false);
  const source = exampleIds.data ? exampleIds.data : [];
  return (
    <div
      style={{
        height: "100%",
        padding: "2rem",
        maxHeight: "100%",
        overflowY: "auto",
      }}
    >
      <Switch value={isAL} onChange={(e, v) => setIsAL(v)} />
      {isAL ? (
        <ActiveLearningContextProvider>
          <ActiveLearningBody />
        </ActiveLearningContextProvider>
      ) : (
        source
          .slice(0, 10)
          .map((ex) => (
            <Example
              key={ex}
              score={1}
              exampleId={ex}
              addSpanId={spanRegistry.addSpanId}
            />
          ))
      )}
    </div>
  );
};
const OpenAnnotationBody: FunctionComponent = () => {
  return <TwoColumnBody Left={<LabelControls />} Right={<Body />} />;
};

export default OpenAnnotationBody;
