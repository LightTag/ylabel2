import React, { FunctionComponent } from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";
const useStyles = makeStyles((theme) => ({
  root: {
    fontSize: "0.5rem",
    boxShadow: "1px 1px 1px #CDCDCD",
    borderRadius: "2px",
    padding: "2px",
    cursor: "pointer",
  },
  term: {},
  score: {},
}));
const SignificantTerm: FunctionComponent<{
  term: string;
  score: number;
  label: string;
  searchForTerm: (term: string) => void;
}> = (props) => {
  const { term } = props;
  const classes = useStyles();
  return (
    <div className={classes.root} onClick={() => props.searchForTerm(term)}>
      <div className={classes.term}>{term}</div>
    </div>
  );
};

export default SignificantTerm;
