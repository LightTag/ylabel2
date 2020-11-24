import React, { FunctionComponent } from "react";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup/ToggleButtonGroup";
import HumanIcon from "@material-ui/icons/Person";
import RobotIcon from "@material-ui/icons/Adb";
import { ToggleButton } from "@material-ui/lab";
import { ILabelController } from "../../../controllers/controllerInterfaces";

interface Props {
  labelName: string;
  labelController: ILabelController;
}

const SelectedLabelToggle: FunctionComponent<Props> = (props) => {
  const labelName = props.labelName;

  const value = React.useMemo(() => {
    const res: string[] = [];
    const isHuman = props.labelController.filteredLabel === labelName;
    const isPred = props.labelController.filteredPrediction === labelName;
    if (isHuman) {
      res.push("human");
    }
    if (isPred) {
      res.push("pred");
    }
    return res;
  }, [
    props.labelController.filteredPrediction,
    props.labelController.filteredLabel,
    labelName,
  ]);

  return (
    <ToggleButtonGroup
      onChange={(e, v) =>
        props.labelController.changeLabelFilter(props.labelName, v)
      }
      value={value}
      size="small"
    >
      <ToggleButton
        size={"small"}
        style={{ fontSize: "0.75rem" }}
        value={"human"}
      >
        <HumanIcon fontSize={"small"} style={{ color: "white" }} />
      </ToggleButton>
      <ToggleButton value={"pred"} size={"small"}>
        <RobotIcon fontSize={"small"} style={{ color: "white" }} />
      </ToggleButton>
    </ToggleButtonGroup>
  );
};

export default SelectedLabelToggle;
