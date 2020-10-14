import { createSlice, PayloadAction } from "@reduxjs/toolkit";

declare namespace ClassificationActions {
  export interface ClassificationState {
    classifications: Record<string, string>;
    labels: Array<string>;
    labelsToExample: Record<string, Array<string>>;
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
    labels: [],
    labelsToExample: {},
  };
}

const classificationSlice = createSlice({
  name: "classificationSlice",
  initialState: initialStateFactory(),
  reducers: {
    addLabel(state, action: PayloadAction<ClassificationActions.ANewLabel>) {
      if (!state.labels.includes(action.payload.name)) {
        state.labels.push(action.payload.name);
        state.labelsToExample[action.payload.name] = [];
      }
    },
    deleteLabel(
      state,
      action: PayloadAction<ClassificationActions.ADeleteLabel>
    ) {
      state.labels = state.labels.filter((x) => x !== action.payload.name);
      const exampleIdsToClear = state.labelsToExample[action.payload.name];
      exampleIdsToClear.forEach((exampleId) => {
        delete state.classifications[exampleId];
      });
      delete state.labelsToExample[action.payload.name];
    },
    classify(state, action: PayloadAction<ClassificationActions.AClassify>) {
      const { exampleId, labelName } = action.payload;
      const currentLabel = state.classifications[exampleId];
      debugger;
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
