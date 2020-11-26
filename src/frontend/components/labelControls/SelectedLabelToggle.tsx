import React, { FunctionComponent } from "react";
import { ILabelController } from "../../../controllers/controllerInterfaces";
import { Checkbox } from "@material-ui/core";
import FormControlLabel from "@material-ui/core/FormControlLabel";

interface Props {
  labelName: string;
  labelController: ILabelController;
}

const SelectedLabelToggle: FunctionComponent<Props> = React.memo((props) => {
  const labelName = props.labelName;

  const handleClickHuman = () => {
    if (props.labelController.filteredLabel === props.labelName) {
      // Then we are unselecting
      props.labelController.changeLabelFilter(null, "human");
    } else {
      props.labelController.changeLabelFilter(labelName, "human");
    }
  };
  const handleClickModel = () => {
    if (props.labelController.filteredPrediction === props.labelName) {
      // Then we are unselecting
      props.labelController.changeLabelFilter(null, "pred");
    } else {
      props.labelController.changeLabelFilter(labelName, "pred");
    }
  };
  return (
    <span>
      <FormControlLabel
        control={
          <Checkbox
            checked={props.labelController.filteredLabel === labelName}
            onChange={handleClickHuman}
            inputProps={{ "aria-label": "primary checkbox" }}
          />
        }
        label="Labels"
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={props.labelController.filteredPrediction === labelName}
            onChange={handleClickModel}
            inputProps={{ "aria-label": "primary checkbox" }}
            color={"primary"}
          />
        }
        label={"Predictions"}
      />
    </span>
  );
});

export default SelectedLabelToggle;
