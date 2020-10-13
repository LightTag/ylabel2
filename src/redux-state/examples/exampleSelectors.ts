import { RootState } from "../rootState";
import { createSelector } from "@reduxjs/toolkit";

export const selectExampleIds = (state: RootState) =>
  state.exampleReducer.exampleIds;
