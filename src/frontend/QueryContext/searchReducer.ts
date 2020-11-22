/*
 * Reducer to be used with useReducer not redux.
 * */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

namespace SearchTypes {
  type THas = 1 | -1;
  export interface SearchParams {
    //We make them null so that we can distinguish from undefined
    hasLabel: THas | null;
    hasPrediction: THas | null;
    label: string | null;
    predictedLabel: string | null;
    // confidence: null | {
    //   lt: number;
    //   gt: number;
    //   between: [number, number];
    // };
    searchQuery: null | string;
    hasFilter: boolean;
  }
  export interface ASetSearchParams {
    params: Partial<SearchParams>;
  }
}
function initialStateFactory(): SearchTypes.SearchParams {
  return {
    hasLabel: null,
    hasPrediction: null,
    label: null,
    searchQuery: null,
    predictedLabel: null,
    hasFilter: false,
  };
}
const searchSlice = createSlice({
  name: "classificationSlice",
  initialState: initialStateFactory(),
  reducers: {
    setSearchParams(
      state,
      action: PayloadAction<SearchTypes.ASetSearchParams>
    ) {
      Object.entries(action.payload.params).forEach(([key, value]) => {
        //@ts-ignore
        state[key] = value;
      });
      state.hasFilter =
        state.hasLabel !== null ||
        state.hasPrediction !== null ||
        state.label !== null ||
        state.predictedLabel !== null;
    },
  },
});
export default searchSlice;
