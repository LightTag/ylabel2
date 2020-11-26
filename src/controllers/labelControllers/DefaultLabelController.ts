import React from "react";
import { useAnnotateAll } from "../../frontend/components/labelControls/labelControls";
import { useDispatch } from "react-redux";
import searchSlice from "../../frontend/QueryContext/searchReducer";
import { ILabelController } from "../controllerInterfaces";
import { useTypedSelector } from "../../frontend/redux-state/rootState";
import { IndexWorkerSingleton } from "../../backend/workers/docIndex/IndexWorkerSingleton";

export default function useDefaultLabelController(): ILabelController {
  const dispatch = useDispatch();
  const {
    label: filteredLabel,
    predictedLabel: filteredPrediction,
  } = useTypedSelector((state) => state.searchReducer);

  const [applyLabelToSearchResults] = useAnnotateAll();
  return React.useMemo(() => {
    const searchForTerm = (term: string) => {
      dispatch(
        searchSlice.actions.setSearchParams({
          params: { searchQuery: term },
        })
      );
    };
    const changeLabelFilter = (
      labelName: string | null,
      source: "human" | "pred"
    ) => {
      const change: Record<string, string | null> = {};
      if (source === "human") {
        change["label"] = labelName;
      }
      if (source === "pred") {
        change["predictedLabel"] = labelName;
      }

      dispatch(searchSlice.actions.setSearchParams({ params: change }));
    };
    return {
      getSignificantTerms: (labelName) =>
        IndexWorkerSingleton.getInstance().getSignificantTermsForLabel(
          labelName
        ),
      applyLabelToSearchResults,
      searchForTerm,
      changeLabelFilter,
      filteredLabel,
      filteredPrediction,
    };
  }, [applyLabelToSearchResults, dispatch, filteredLabel, filteredPrediction]);
}
