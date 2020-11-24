import React, { FunctionComponent } from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { Grid } from "@material-ui/core";
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
  },
  nameContainer: {
    textTransform: "uppercase",
    fontWeight: "bold",
    fontSize: "0.75rem",
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
  let style: { border: string; color: string; background: string };

  style = React.useMemo(() => {
    const color = colorManaer.getLabelColor(labelName);
    return {
      background: color,
      color: "white",
      border: "1px solid",
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
      <Grid container alignItems={"center"} spacing={2}>
        <Grid item className={classes.nameContainer} xs={2}>
          <span className={classes.nameContainer}>
            {" "}
            {labelName} - {props.count}{" "}
          </span>
        </Grid>
        <Grid item xs={10}>
          <SignificantTermsContainer
            label={labelName}
            labelController={props.labelController}
          />
        </Grid>

        <Grid item xs={2}>
          <span
            className={classes.toggleButton}
            onClick={() =>
              props.labelController.applyLabelToSearchResults(labelName)
            }
          >
            {" "}
            Label All{" "}
          </span>
        </Grid>
        <Grid item>
          <SelectedLabelToggle
            labelName={labelName}
            labelController={props.labelController}
          />
        </Grid>

        {/*<Grid item xs={4}>*/}
        {/*  /!*<AnnotateAllButton label={props.labelName} />*!/*/}
        {/*</Grid>*/}
      </Grid>
    </div>
  );
});

export default LabelRow;
