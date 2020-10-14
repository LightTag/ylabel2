import { RootState } from "../rootState";

export const selectExampleIds = (state: RootState) =>
  state.exampleReducer.exampleIds;
