import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import Data from "../../data_clients/datainterfaces";
import { exampleStoreIndexDB } from "../../data_clients/exampleDataStore";
import { AppThunk } from "../rootState";
declare namespace ExampleActions {
  export interface ExampleState {
    exampleIds: (string | number)[];
    exampleIdsByDatasetName: Record<string, (string | number)[]>;
  }

  export interface AAddExampleByObject {
    examples: Data.Example[];
  }
}
function initialStateFactory(): ExampleActions.ExampleState {
  return {
    exampleIds: [],
    exampleIdsByDatasetName: {},
  };
}

const exampleSlice = createSlice({
  name: "exampleSlice",
  initialState: initialStateFactory(),
  reducers: {
    addExamples(
      state,
      action: PayloadAction<ExampleActions.AAddExampleByObject>
    ) {
      action.payload.examples.forEach((example) => {
        state.exampleIds.push(example.exampleId);
        if (example.datasetName) {
          const datasetSlice =
            state.exampleIdsByDatasetName[example.datasetName];
          if (datasetSlice) {
            datasetSlice.push(example.exampleId);
          } else {
            state.exampleIdsByDatasetName[example.datasetName] = [
              example.exampleId,
            ];
          }
        }
      });
    },
  },
});

export const addExamplesThunk = (examples: Data.Example[]): AppThunk => async (
  dispatch
) => {
  await exampleStoreIndexDB.setItems(
    examples.map((ex) => ({ key: ex.exampleId, value: ex }))
  );
  dispatch(exampleSlice.actions.addExamples({ examples }));
};
const exampleReducer = exampleSlice.reducer;
export default exampleReducer;
