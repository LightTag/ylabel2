import { createSlice, PayloadAction } from "@reduxjs/toolkit";

declare namespace ClassificationActions {
  export interface ClassificationState {
    classifications: Record<string, string>;
    labels: Record<string, boolean>;
    labelsToExample: Record<string, string[]>;
  }

  export interface ANewLabel {
    name: string;
  }

  export interface ADeleteLabel {
    name: string;
  }

  export interface AClassify {
    exampleId: string;
    labelName: string | null; // null is delete
  }
}

function initialStateFactory(): ClassificationActions.ClassificationState {
  return {
    classifications: {},
    labels: {},
    labelsToExample: {},
  };
}

const classificationSlice = createSlice({
  name: "classificationSlice",
  initialState: initialStateFactory(),
  reducers: {
    addLabel(state, action: PayloadAction<ClassificationActions.ANewLabel>) {
      debugger;
      if (!state.labels[action.payload.name]) {
        state.labels[action.payload.name] = true;
        state.labelsToExample[action.payload.name] = [];
      }
    },
    deleteLabel(
      state,
      action: PayloadAction<ClassificationActions.ADeleteLabel>
    ) {
      delete state.labels[action.payload.name];
      const exampleIdsToClear = state.labelsToExample[action.payload.name];
      exampleIdsToClear.forEach((exampleId) => {
        delete state.classifications[exampleId];
      });
      delete state.labelsToExample[action.payload.name];
    },
    classify(state, action: PayloadAction<ClassificationActions.AClassify>) {
      debugger;
      const { exampleId, labelName } = action.payload;
      const currentLabel = state.classifications[exampleId];
      if (currentLabel === labelName) {
        //do nothing
      } else {
        if (currentLabel !== undefined) {
          //clear the old label
          state.labelsToExample[currentLabel] = state.labelsToExample[
            currentLabel
          ].filter((x) => x !== exampleId);
        }
        if (labelName !== null) {
          //If the user added a classification
          debugger;
          state.labelsToExample[labelName].push(exampleId);
          state.classifications[exampleId] = labelName;
        } else {
          //If the user deleted a classification
          delete state.classifications[exampleId];
        }
      }
    },
  },
});

export const classificationActions = classificationSlice.actions;

export default classificationSlice.reducer;
