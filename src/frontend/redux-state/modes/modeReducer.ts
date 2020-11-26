import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type TModes = "Regular" | "ActiveLearning";
export interface AppModeState {
  mode: TModes;
}
interface AChangeMode {
  mode: TModes;
}

function initialStateFactory(): AppModeState {
  return {
    mode: "Regular",
  };
}

const appModeSlice = createSlice({
  name: "appMode",
  initialState: initialStateFactory(),
  reducers: {
    changeMode(state, action: PayloadAction<AChangeMode>) {
      state.mode = action.payload.mode;
    },
  },
});

export default appModeSlice;
