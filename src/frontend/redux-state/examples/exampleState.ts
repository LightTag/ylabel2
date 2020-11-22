import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppThunk } from "../rootState";
import TFIDFTransformer from "../../../backend/workers/aiWorker/workerProcedures/vectorizers/tfidf";
import Data from "../../../backend/data_clients/datainterfaces";
import { InsertToDBEvent } from "../../../backend/workers/aiWorker/ai_worker";
import { GenericWorkerTypes } from "../../../backend/workers/common/datatypes";
import { IndexWorkerSingleton } from "../../../backend/workers/docIndex/IndexWorkerSingleton";
import { EventKinds } from "../../../backend/utils/logger";
import AIWorkerSingleton from "../../../backend/workers/aiWorker/AIWorkerSingleton";

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
const worker = AIWorkerSingleton.getInstance();
export const addExamplesThunk = (
  examples: Data.Example[]
): AppThunk => async () => {
  const event: InsertToDBEvent = {
    direction: GenericWorkerTypes.ERquestOrResponesOrUpdate.request,
    requestId: -100,
    workerName: GenericWorkerTypes.EWorkerName.dataLoader,
    kind: EventKinds.insertToDb,
    payload: {
      examples: examples,
    },
  };

  const indexWorkerSingleton = IndexWorkerSingleton.getInstance();
  debugger;
  //@ts-ignore

  worker.worker.postMessage(event);
  indexWorkerSingleton.addDocs(examples);
};
const exampleReducer = exampleSlice.reducer;
export default exampleReducer;
