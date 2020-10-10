import React, { FunctionComponent } from "react";
import { useTypedSelector } from "../redux-state/rootState";
import classificationSelectors from "../redux-state/classificationSelectors";
import exp from "constants";
const ClassificationStats: FunctionComponent = (props) => {
  const stats = useTypedSelector(classificationSelectors.selectLabelCounts);
  return (
    <ul>
      {Object.entries(stats).map(([label, count]) => (
        <li key={label}>
          {" "}
          {label}-{count}
        </li>
      ))}
    </ul>
  );
};

export default ClassificationStats;
