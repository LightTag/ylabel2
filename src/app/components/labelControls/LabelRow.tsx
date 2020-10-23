import React, { FunctionComponent } from "react";
import colorManaer from "app/utils/labelsetcolors/labelsetcolors";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { Grid } from "@material-ui/core";
const useStyles = makeStyles((theme) => ({
  root: {
    width: "75%",
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
  labelName: string;
  selected: boolean;
  onClick?: (val: string | null) => void;
  comment?: string;
}> = React.memo((props) => {
  const classes = useStyles();
  const labelName = props.labelName;
  const style = React.useMemo(() => {
    const color = colorManaer.getLabelColor(labelName);
    return {
      background: color,
      color: "white",
      border: "1px solid",
    };
  }, [labelName, props.selected]);

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
          <span className={classes.nameContainer}> {labelName} </span>
        </Grid>
        <Grid item xs={2}>
          <span className={classes.toggleButton}> Predicted </span>
        </Grid>
        <Grid item xs={2}>
          <span className={classes.toggleButton}> Labeled </span>
        </Grid>
        <Grid item xs={2}>
          <span className={classes.toggleButton}> Label All </span>
        </Grid>

        {/*<Grid item xs={4}>*/}
        {/*  /!*<AnnotateAllButton label={props.labelName} />*!/*/}
        {/*</Grid>*/}
      </Grid>
    </div>
  );
});

export default LabelRow;
