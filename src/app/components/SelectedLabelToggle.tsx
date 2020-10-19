import React, { FunctionComponent } from "react";
import { useTypedSelector } from "app/redux-state/rootState";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup/ToggleButtonGroup";
import HumanIcon from "@material-ui/icons/Person";
import RobotIcon from "@material-ui/icons/Adb";
import { ToggleButton } from "@material-ui/lab";
import { useDispatch } from "react-redux";
import searchSlice from "app/QueryContext/searchReducer";
interface Props {
  labelName: string;
}
const SelectedLabelToggle: FunctionComponent<Props> = (props) => {
  const labelName = props.labelName;
  const {
    label: filteredLabel,
    predictedLabel: filteredPrediction,
  } = useTypedSelector((state) => state.searchReducer);
  const value = React.useMemo(() => {
    const res: string[] = [];
    const isHuman = filteredLabel === labelName;
    const isPred = filteredPrediction === labelName;
    if (isHuman) {
      res.push("human");
    }
    if (isPred) {
      res.push("pred");
    }
    return res;
  }, [filteredPrediction, filteredLabel, labelName]);

  const dispatch = useDispatch();
  const handleChange = (val: string[]) => {
    const change: Record<string, string | null> = {};
    change["label"] = val.includes("human") ? labelName : null;
    change["predictedLabel"] = val.includes("pred") ? labelName : null;
    dispatch(searchSlice.actions.setSearchParams({ params: change }));
  };
  return (
    <ToggleButtonGroup
      onChange={(e, v) => handleChange(v)}
      value={value}
      size="small"
    >
      <ToggleButton value={"human"}>
        <HumanIcon />
      </ToggleButton>
      <ToggleButton value={"pred"}>
        <RobotIcon />
      </ToggleButton>
    </ToggleButtonGroup>
  );
};

export default SelectedLabelToggle;
