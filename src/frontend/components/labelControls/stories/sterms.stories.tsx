import SignificantTermsList from "../significantTerms/SignificantTermsList";
import React from "react";

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  title: "Sterm/SignificantTermsList",
  component: SignificantTermsList,
};

const terms = "Tal is here and he likes to eat chicken with eggs"
  .split(" ")
  .map((word, score) => ({ word, score }));

export const Basic = () => (
  <SignificantTermsList
    terms={terms}
    searchForTerm={() => null}
    label={"Green"}
  />
);
