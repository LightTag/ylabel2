import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import Data from "../../data_clients/datainterfaces";
import { exampleStoreIndexDB } from "../../data_clients/exampleDataStore";
import { AppThunk } from "../rootState";
import TFIDFTransformer from "app/classifier/tfidf";
import Worker from "worker-loader!../../classifier/test.worker";

import { EventKinds, InsertToDBEvent } from "app/classifier/test.worker";

declare namespace ExampleActions {
  export interface ExampleState {
    exampleIds: (string | number)[];
    exampleIdsByDatasetName: Record<string, (string | number)[]>;
    exampleTermFrequency: Record<string, Record<string, number>>;
    docFrequency: Record<string, number>;
  }

  export interface AAddExampleByObject {
    examples: Data.Example[];
  }
}

function initialStateFactory(): ExampleActions.ExampleState {
  return {
    exampleIds: [],
    exampleIdsByDatasetName: {},
    exampleTermFrequency: {},
    docFrequency: {},
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
      const transformer = new TFIDFTransformer();
      transformer.fitTransform(action.payload.examples);
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
const worker = new Worker();
export const addExamplesThunk = (examples: Data.Example[]): AppThunk => async (
  dispatch
) => {
  if (examples.length < 200) {
    await exampleStoreIndexDB.setItems(
      examples.map((ex) => ({ key: ex.exampleId, value: ex }))
    );
    dispatch(exampleSlice.actions.addExamples({ examples }));
  } else {
    const firstBatch = examples.slice(0, 150);
    const remaining = examples.slice(150);
    const event: InsertToDBEvent = {
      kind: EventKinds.insertToDb,
      payload: {
        examples: remaining,
      },
    };
    worker.postMessage(event);
    dispatch(addExamplesThunk(firstBatch));
  }
};
const exampleReducer = exampleSlice.reducer;
export default exampleReducer;
