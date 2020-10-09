import { useSelector, TypedUseSelectorHook } from 'react-redux'
import {combineReducers, configureStore} from "@reduxjs/toolkit";
const rootReducer = combineReducers({})
const store = configureStore({reducer:rootReducer})
export type RootState = ReturnType<typeof rootReducer>
export const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector
