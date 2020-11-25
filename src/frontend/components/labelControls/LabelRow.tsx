import React, { FunctionComponent } from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";
import colorManaer from "../../utils/labelsetcolors/labelsetcolors";
import SignificantTermsContainer from "./significantTerms/SignificantTermsContainer";
import SelectedLabelToggle from "./SelectedLabelToggle";
import { ILabelController } from "../../../controllers/controllerInterfaces";

const useStyles = makeStyles((theme) => ({
  root: {
    marginBottom: "2px",
    textOverflow: "ellipsis",
    cursor: "pointer",
    padding: theme.spacing(1),
    marginRight: theme.spacing(1),
    borderRadius: "4px",
    fontWeight: "bold",
    userSelect: "none",
    fontSize: "0.75rem",
    display: "inline-block",
    width: "100%",
    maxHeight: "200px",
    position: "relative",
    marginTop: "1rem",
    "&>label": {
      padding: "0.15rem",
      background: "white",
      position: "absolute",
      top: "-1rem",
    },
  },
  nameContainer: {
    textTransform: "uppercase",
    fontWeight: "bold",
    fontSize: "0.75rem",
  },
  termsContainer: {
    marginTop: "1rem",

    border: "1px solid black",
    fontSize: "10px",
    position: "relative",
    display: "inline-flex",
    width: "100%",
    "flex-wrap": "wrap",
    "&>label": {
      padding: "0.15rem",
      background: "white",
      position: "absolute",
      top: "-1rem",

      fontSize: "0.7rem",
      border: "1px solid black",
      borderBottom: "none",
      borderRadius: "4px",
    },
  },
  controlorContainers: {
    width: "66%",
  },
  toggleButton: {
    border: "0.1rem solid white",
    padding: "0.25rem",
    textTransform: "uppercase",
    fontSize: "0.5rem",
  },
}));
const LabelRow: FunctionComponent<{
  count: number;
  labelName: string;
  selected: boolean;
  labelController: ILabelController;
  onClick?: (val: string | null) => void;
  comment?: string;
}> = React.memo((props) => {
  const classes = useStyles();
  const labelName = props.labelName;
  let style: { border: string; borderColor: string };
  const color = colorManaer.getLabelColor(labelName);
  style = React.useMemo(() => {
    const color = colorManaer.getLabelColor(labelName);
    return {
      borderColor: color,
      border: `1px solid ${color}`,
    };
  }, [labelName]);

  const handleClick = () => {
    if (!props.onClick) {
      return;
    }
    if (props.selected) {
      props.onClick(null);
    } else {
      props.onClick(labelName);
    }
  };

  return (
    <div
      style={style}
      className={classes.root}
      onClick={handleClick}
      tabIndex={0}
    >
      <label className={classes.nameContainer} style={{ color: color }}>
        {" "}
        {labelName} - {props.count}{" "}
      </label>
      <span
        className={classes.toggleButton}
        onClick={() =>
          props.labelController.applyLabelToSearchResults(labelName)
        }
      >
        {" "}
        Label All{" "}
      </span>
      <SelectedLabelToggle
        labelName={labelName}
        labelController={props.labelController}
      />
      <span className={classes.termsContainer}>
        <label>Keywords</label>
        <SignificantTermsContainer
          label={labelName}
          labelController={props.labelController}
          count={props.count}
        />
      </span>
    </div>
  );
});

export default LabelRow;
