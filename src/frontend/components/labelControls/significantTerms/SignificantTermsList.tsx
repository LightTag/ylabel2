import React, { FunctionComponent } from "react";
import { Grid } from "@material-ui/core";
import SignificantTerm from "./SignificantTerm";

const SignificantTermsList: FunctionComponent<{
  terms: { word: string; score: number }[];
  searchForTerm: (term: string) => void;
  label: string;
}> = (props) => {
  return (
    <Grid container spacing={1}>
      {props.terms.slice(0, 22).map((ws) => (
        <Grid item>
          <SignificantTerm
            term={ws.word}
            score={ws.score}
            label={props.label}
            searchForTerm={props.searchForTerm}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default SignificantTermsList;
