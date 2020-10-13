import { useSelector, TypedUseSelectorHook } from "react-redux";
import { enableMapSet, enableAllPlugins } from "immer";
import {
  Action,
  combineReducers,
  configureStore,
  ThunkAction,
} from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // defaults to localStorage for web

import classificationReducer from "./classification/classificationReducer";
import exampleReducer from "./examples/exampleState";
export const res = enableMapSet();

enableAllPlugins();
const rootReducer = combineReducers({ classificationReducer, exampleReducer });
const persistConfig = {
  key: "root",
  storage,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({ reducer: persistedReducer });
let persistor = persistStore(store);

export type RootState = ReturnType<typeof rootReducer>;
export type AppThunk = ThunkAction<void, RootState, unknown, Action<string>>;

export const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;
export default store;
