import { useSelector, TypedUseSelectorHook } from "react-redux";
import { enableMapSet, enableAllPlugins } from "immer";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // defaults to localStorage for web

import classificationReducer from "./classificationReducer";
export const res = enableMapSet();

enableAllPlugins();
const rootReducer = combineReducers({ classificationReducer });
const persistConfig = {
  key: "root",
  storage,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({ reducer: persistedReducer });
let persistor = persistStore(store);

export type RootState = ReturnType<typeof rootReducer>;

export const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;
export default store;
