import React, { FunctionComponent } from "react";
import { ActiveLearningContext } from "app/active_learning/ActiveLearningContext";
import Example from "app/components/example/Example";
import { Button } from "@material-ui/core";

const ActiveLearningBody: FunctionComponent = () => {
  const context = React.useContext(ActiveLearningContext);
  if (!context) {
    return <div>Not in an active learning context</div>;
  }
  if (context.currentExample === undefined) {
    return <div>No example in context</div>;
  }
  return (
    <div>
      <Example score={1} exampleId={context.currentExample.exampleId} />;
      <Button onClick={context.goToNext}>Skip</Button>
    </div>
  );
};

export default ActiveLearningBody;
