import React, { FunctionComponent } from "react";
import { useTypedSelector } from "../../redux-state/rootState";
import { useDispatch } from "react-redux";
import appModeSlice from "../../redux-state/modes/modeReducer";
import Switch from "@material-ui/core/Switch";
import FormControlLabel from "@material-ui/core/FormControlLabel";

const ActiveLearningToggleContainer: FunctionComponent = () => {
  const mode = useTypedSelector((state) => state.appMode.mode);
  const dispatch = useDispatch();
  const handleChange = () => {
    const nextMode = mode === "Regular" ? "ActiveLearning" : "Regular";
    dispatch(appModeSlice.actions.changeMode({ mode: nextMode }));
  };

  return (
    <FormControlLabel
      labelPlacement={"bottom"}
      control={
        <Switch value={mode === "ActiveLearning"} onChange={handleChange} />
      }
      label={"Active Learning"}
    />
  );
};

export default ActiveLearningToggleContainer;
