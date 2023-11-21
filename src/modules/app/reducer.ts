import { createReducer } from "@reduxjs/toolkit";
import { Artboard } from "../../App";
import { initState, setArtboards } from "./actions";

export interface ApplicationState {
  artboards: Array<Artboard>;
}

const initialState: ApplicationState = {
  artboards: [],
};

const appReducer = createReducer(initialState, (builder) => {
  return builder
    .addCase(initState, (state, action) => {
      state.artboards = action.payload;
    })
    .addCase(setArtboards, (state, action) => {
      state.artboards = action.payload;
    });
});

export default appReducer;
