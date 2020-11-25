import { SignificantTerm } from "../backend/workers/docIndex/indexWorkerTypes";

export interface ILabelController {
  getSignificantTerms: (
    labelName: string
  ) => Promise<{ terms: Array<SignificantTerm>; labelName: string }>;
  applyLabelToSearchResults: (labelName: string) => void;
  searchForTerm: (term: string) => void;
  changeLabelFilter: (
    labelName: string | null,
    source: "human" | "pred"
  ) => void;
  filteredLabel: string | null;
  filteredPrediction: string | null;
}
