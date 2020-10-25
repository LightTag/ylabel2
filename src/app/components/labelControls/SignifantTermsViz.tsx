import React, { FunctionComponent } from "react";
import { useQuery } from "react-query";
import significantTermsForLabel from "app/workers/docIndex/significantTerms";
import { makeStyles } from "@material-ui/core/styles";
import { useDispatch } from "react-redux";
import searchSlice from "app/QueryContext/searchReducer";

const useStyles = makeStyles(() => ({
  root: {
    display: "inline-flex",
  },
  termRoot: {
    border: "0.1rem solid white",
    fontSize: "0.75rem",
    padding: "0.1rem",
    margin: "0rem 0.1rem",
  },
}));
const STerm: FunctionComponent<{
  term: string;
  score: number;
  label: string;
}> = (props) => {
  const { term, score } = props;
  const classes = useStyles();
  const dispatch = useDispatch();
  const handleChange = () => {
    dispatch(
      searchSlice.actions.setSearchParams({
        params: { searchQuery: term },
      })
    );
  };
  return (
    <div className={classes.termRoot} onClick={handleChange}>
      <div>{term}</div>
      <div>{score.toLocaleString("en", { maximumFractionDigits: 1 })}</div>
    </div>
  );
};
const SignificantTermsViz: FunctionComponent<{ label: string }> = (props) => {
  const classes = useStyles();
  const query = useQuery(["sigTerms", props.label], () =>
    significantTermsForLabel(props.label)
  );

  if (query.data === undefined) {
    return <div>"calculating"</div>;
  } else {
    console.log({ label: props.label, terms: query.data.slice(10) });
  }
  return (
    <div className={classes.root}>
      <div onClick={() => query.refetch()}>More</div>
      {query.data.slice(0, 15).map((ws) => (
        <STerm term={ws.word} score={ws.score} label={props.label} />
      ))}
    </div>
  );
};

export default SignificantTermsViz;
