import React, { FunctionComponent } from "react";
import useDatabase from "../../../backend/database/useDatabase";
import OpenAnnotationBody from "./OpenAnnotationBodyLayout";
import WelcomeLayout from "./WelcomeLayout";

const LayoutDispatch: FunctionComponent = () => {
  const exampleCount = useDatabase(
    "exampleCount",
    "example",
    (db) => db.example.count(),
    undefined
  );
  if (exampleCount.data) {
    return <OpenAnnotationBody />;
  } else {
    return <WelcomeLayout />;
  }
};

export default LayoutDispatch;
