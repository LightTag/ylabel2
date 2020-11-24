import React from "react";
import { ILabelController } from "../controllerInterfaces";

function useMocklLabelController(): ILabelController & {
  setTerms: (terms: string[]) => void;
} {
  // Use this one for story book
  const [terms, setTerms] = React.useState<string[]>(
    "I am Tal and I like to eat chicken with nuggets".split(" ")
  );

  return {
    getSignificantTerms: () =>
      Promise.resolve(terms.map((word, score) => ({ word, score }))),
    applyLabelToSearchResults: () => {},
    searchForTerm: () => {},
    changeLabelFilter: () => {},
    filteredPrediction: null,
    filteredLabel: null,
    setTerms,
  };
}

export default useMocklLabelController;
