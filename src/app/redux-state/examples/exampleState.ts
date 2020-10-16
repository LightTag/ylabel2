import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import Data from "../../data_clients/datainterfaces";
import { AppThunk } from "../rootState";
import TFIDFTransformer from "app/classifier/tfidf";
import Worker from "worker-loader!../../classifier/test.worker";

import { EventKinds, InsertToDBEvent } from "app/classifier/test.worker";
import { IndexWorkerController } from "app/docIndex/IndexWorkerController";

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
export const addExamplesThunk = (
  examples: Data.Example[]
): AppThunk => async () => {
  const event: InsertToDBEvent = {
    kind: EventKinds.insertToDb,
    payload: {
      examples: examples,
    },
  };

  worker.postMessage(event);
  IndexWorkerController.addDocs(examples);
};
const exampleReducer = exampleSlice.reducer;
export default exampleReducer;
