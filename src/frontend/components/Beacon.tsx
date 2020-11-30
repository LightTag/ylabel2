import React, { FunctionComponent } from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";

const useStyles = makeStyles((theme) => ({
  "@keyframes active": {
    "0%": {
      webkitTransform: "scale(.1)",
      opacity: "1",
      transform: "scale(.1)",
    },
    "70%": {
      webkitTransform: "scale(2.5)",
      opacity: "0",
      transform: "scale(2.5)",
    },
    "100%": {
      opacity: "0",
    },
  },
  beaconContainer: {
    position: "relative",
  },

  beacon: {
    position: "absolute",
    top: "50%",
    left: "50%",
    backgroundColor: theme.palette.secondary.light,
    height: theme.spacing(1),
    width: theme.spacing(1),
    borderRadius: "50%",
    webkitTransform: "translateX(-50%) translateY(-50%)",
    "&:before": {
      position: "absolute",
      content: '""',
      height: theme.spacing(1),
      width: theme.spacing(1),
      left: "0",
      top: "0",
      backgroundColor: "transparent",
      borderRadius: "50%",
      boxShadow: `0px 0px 2px 2px ${theme.palette.secondary.main}`,
      animationName: "$active",
      animationDuration: "2s",
      animationTimingFunction: "linear",
      animationIterationCount: "infinite",
    },
  },
}));

export const Beacon: FunctionComponent<{ show: boolean }> = ({ show }) => {
  const classes = useStyles();
  if (!show) {
    return null;
  }
  return (
    <span className={classes.beaconContainer}>
      <span className={classes.beacon} />
    </span>
  );
};

export default Beacon;
