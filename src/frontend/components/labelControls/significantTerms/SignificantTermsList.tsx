import React, { FunctionComponent } from "react";
import SignificantTerm from "./SignificantTerm";

const SignificantTermsList: FunctionComponent<{
  terms: { word: string; score: number }[];
  searchForTerm: (term: string) => void;
  label: string;
}> = (props) => {
  return (
    <>
      {props.terms.slice(0, 22).map((ws) => (
        <SignificantTerm
          term={ws.word}
          score={ws.score}
          label={props.label}
          searchForTerm={props.searchForTerm}
        />
      ))}
    </>
  );
};

export default SignificantTermsList;
