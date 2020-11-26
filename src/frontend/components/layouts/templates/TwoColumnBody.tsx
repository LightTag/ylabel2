import React from "react";
import { ReflexContainer, ReflexElement, ReflexSplitter } from "react-reflex";
import { AppBarHeight } from "../../appBar/Appbar";
import { useTheme } from "@material-ui/core";
import WorkComp from "../../../classifier/workerComp";

interface Props {
  Left: JSX.Element;
  Right: JSX.Element;
}
const TwoColumnBody: React.FunctionComponent<Props> = (props) => {
  const theme = useTheme();
  return (
    <ReflexContainer
      orientation="vertical"
      style={{
        height: `calc(100vh - ${AppBarHeight})`,
        padding: theme.spacing(2),
      }}
    >
      <ReflexElement propagateDimensions flex={0.25}>
        <div
          style={{
            height: "100%",
            maxHeight: "100%",
            overflowY: "hidden",
          }}
        >
          {props.Left}
        </div>
      </ReflexElement>
      <ReflexSplitter />
      <ReflexElement propagateDimensions flex={0.5}>
        <div
          style={{
            height: "100%",
            maxHeight: "100%",
            overflowY: "auto",
          }}
        >
          {props.Right}
        </div>
      </ReflexElement>
      <ReflexSplitter />
      <ReflexElement propagateDimensions flex={0.25}>
        <div
          style={{
            height: "100%",
            maxHeight: "100%",
            overflowY: "hidden",
          }}
        >
          <WorkComp />
        </div>
      </ReflexElement>
    </ReflexContainer>
  );
};
export default TwoColumnBody;
