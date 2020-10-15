import React, { FunctionComponent } from "react";
import { useTypedSelector } from "../redux-state/rootState";
import classificationSelectors from "../redux-state/classification/classificationSelectors";
import { useDispatch } from "react-redux";
import { classificationActions } from "app/redux-state/classification/classificationReducer";
import { TextField } from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import SaveIcon from "@material-ui/icons/Save";
import { ClassBox } from "app/components/example/ClassificationRibbon";
const AddLabel: FunctionComponent = () => {
  const [name, setName] = React.useState<string | undefined>();
  const dispatch = useDispatch();
  const addLabel = () => {
    if (name) {
      dispatch(classificationActions.addLabel({ name }));
    }
  };
  return (
    <div>
      <TextField
        label={"Add a new label"}
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <IconButton
        size={"small"}
        disabled={name === undefined}
        onClick={addLabel}
      >
        <SaveIcon fontSize={"small"} />
      </IconButton>
    </div>
  );
};
const ClassificationStats: FunctionComponent = (props) => {
  const stats = useTypedSelector(classificationSelectors.selectLabelCounts);
  return (
    <div>
      <AddLabel />

      <ul>
        {Object.entries(stats).map(([label, count]) => (
          <ClassBox
            labelName={`${label} `}
            comment={JSON.stringify(count)}
            selected={true}
            key={label}
          />
        ))}
      </ul>
    </div>
  );
};

export default ClassificationStats;
