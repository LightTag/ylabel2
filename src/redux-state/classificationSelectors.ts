import { RootState, useTypedSelector } from "./rootState";
import { createSelector } from "@reduxjs/toolkit";
import exp from "constants";

const useSelectExampleClassification = (exampleId: string) =>
  useTypedSelector(
    (state) => state.classificationReducer.classifications[exampleId]
  );

const selectLabels = (state: RootState) => state.classificationReducer.labels;
const selectLabelArray = createSelector([selectLabels], (labelNameSet) =>
  Object.keys(labelNameSet)
);
const selectLabelExampleIds = (state: RootState) =>
  state.classificationReducer.labelsToExample;
const selectLabelCounts = createSelector(
  [selectLabelExampleIds],
  (labelExampleIds) => {
    const result: Record<string, number> = {};
    Object.keys(labelExampleIds).forEach((label) => {
      result[label] = labelExampleIds[label].length;
    });
    return result;
  }
);

const classificationSelectors = {
  useSelectExampleClassification,
  selectLabelArray,
  selectLabelCounts,
};
export default classificationSelectors;
