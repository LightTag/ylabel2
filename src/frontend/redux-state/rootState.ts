import { TypedUseSelectorHook, useSelector } from "react-redux";
import { enableAllPlugins, enableMapSet } from "immer";
import {
  Action,
  combineReducers,
  configureStore,
  getDefaultMiddleware,
  ThunkAction,
} from "@reduxjs/toolkit";
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from "redux-persist";

import storage from "redux-persist/lib/storage"; // defaults to localStorage for web
import classificationReducer from "./classification/classificationReducer";
import exampleReducer from "./examples/exampleState";
import searchSlice from "../QueryContext/searchReducer";
import appModeSlice from "./modes/modeReducer";

export const res = enableMapSet();

enableAllPlugins();
const rootReducer = combineReducers({
  classificationReducer,
  exampleReducer,
  searchReducer: searchSlice.reducer,
  appMode: appModeSlice.reducer,
});
const persistConfig = {
  key: "root",
  storage,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware({
    serializableCheck: {
      ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
    },
  }),
});
persistStore(store);

export type RootState = ReturnType<typeof rootReducer>;
export type AppThunk = ThunkAction<void, RootState, unknown, Action<string>>;

export const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;
export default store;
