type SignificantTerm = { word: string; score: number };

export interface ILabelController {
  getSignificantTerms: (labelName: string) => Promise<Array<SignificantTerm>>;
  applyLabelToSearchResults: (labelName: string) => void;
  searchForTerm: (term: string) => void;
  changeLabelFilter: (
    labelName: string | null,
    source: "human" | "pred"
  ) => void;
  filteredLabel: string | null;
  filteredPrediction: string | null;
}
