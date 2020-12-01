import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import TFIDFTransformer from "../../../backend/workers/aiWorker/workerProcedures/vectorizers/tfidf";
import Data from "../../../backend/data_clients/datainterfaces";
import { IndexWorkerSingleton } from "../../../backend/workers/docIndex/IndexWorkerSingleton";

namespace ExampleActions {
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
export async function addExamples(examples: Data.Example[]) {
  const indexWorkerSingleton = IndexWorkerSingleton.getInstance();

  indexWorkerSingleton.addDocs(examples);
  return indexWorkerSingleton.addDocs(examples);
}
const exampleReducer = exampleSlice.reducer;
export default exampleReducer;
