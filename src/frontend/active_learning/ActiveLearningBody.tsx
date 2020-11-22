import React, { FunctionComponent } from "react";
import { ActiveLearningContext } from "./ActiveLearningContext";
import Example from "../components/example/Example";
import { Button } from "@material-ui/core";
import { applyLabel, rejectLabel } from "../../backend/database/dbProcesdures";

const ActiveLearningBody: FunctionComponent = () => {
  const ref = React.useRef<HTMLDivElement>(null);
  const context = React.useContext(ActiveLearningContext);
  React.useEffect(() => {
    if (ref.current) {
      ref.current.focus();
    }
  });
  if (!context) {
    return <div>Not in an active learning context</div>;
  }
  if (context.currentExample === undefined) {
    return <div>No example in context</div>;
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (context.currentExample && context.currentExample.predictedLabel) {
      if (e.key === "x") {
        rejectLabel(
          context.currentExample.exampleId,
          context.currentExample.predictedLabel
        );
        context.goToNext();
      }
      if (e.key === "a") {
        applyLabel(
          context.currentExample.exampleId,
          context.currentExample.predictedLabel
        );
        context.goToNext();
      }
    }
  };
  return (
    <div ref={ref} onKeyDown={onKeyDown} tabIndex={0}>
      <Example score={1} exampleId={context.currentExample.exampleId} />;
      <Button onClick={context.goToNext}>Skip</Button>
    </div>
  );
};

export default ActiveLearningBody;
