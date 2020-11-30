import React from "react";
import { ReflexContainer, ReflexElement, ReflexSplitter } from "react-reflex";
import { AppBarHeight } from "../../appBar/Appbar";
import { useTheme } from "@material-ui/core";

interface Props {
  Left: JSX.Element;
  Middle: JSX.Element;
  Right: JSX.Element;
}
const ThreeColumnBody: React.FunctionComponent<Props> = (props) => {
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
            width: "100%",
            maxWidth: "100%",
            maxHeight: "100%",
            overflowY: "auto",
          }}
        >
          {props.Middle}
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
          <div style={{ padding: "2rem" }}>{props.Right}</div>
        </div>
      </ReflexElement>
    </ReflexContainer>
  );
};
export default ThreeColumnBody;
