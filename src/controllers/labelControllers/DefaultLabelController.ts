import significantTermsForLabel from "../../backend/workers/docIndex/significantTerms";
import { useAnnotateAll } from "../../frontend/components/labelControls/labelControls";
import { useDispatch } from "react-redux";
import searchSlice from "../../frontend/QueryContext/searchReducer";
import { ILabelController } from "../controllerInterfaces";
import { useTypedSelector } from "../../frontend/redux-state/rootState";

export default function useDefaultLabelController(): ILabelController {
  const dispatch = useDispatch();
  const {
    label: filteredLabel,
    predictedLabel: filteredPrediction,
  } = useTypedSelector((state) => state.searchReducer);
  const changeLabelFilter = (labelName: string, val: string[]) => {
    const change: Record<string, string | null> = {};
    change["label"] = val.includes("human") ? labelName : null;
    change["predictedLabel"] = val.includes("pred") ? labelName : null;
    dispatch(searchSlice.actions.setSearchParams({ params: change }));
  };
  const searchForTerm = (term: string) => {
    dispatch(
      searchSlice.actions.setSearchParams({
        params: { searchQuery: term },
      })
    );
  };
  const [applyLabelToSearchResults] = useAnnotateAll();
  return {
    getSignificantTerms: significantTermsForLabel,
    applyLabelToSearchResults,
    searchForTerm,
    changeLabelFilter,
    filteredLabel,
    filteredPrediction,
  };
}
