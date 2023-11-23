import { createReducer } from "@reduxjs/toolkit";
import { initState, updateArtboards, setSelectedArtboard } from "./actions";
import { Artboard } from "../../types";

export interface ApplicationState {
  artboards: Array<Artboard>;
  selectedArtboard: Artboard | null;
}

const initialState: ApplicationState = {
  selectedArtboard: null,
  artboards: [],
};

const appReducer = createReducer(initialState, (builder) => {
  return builder
    .addCase(initState, (state, action) => {
      state.artboards = action.payload;
    })
    .addCase(updateArtboards, (state, action) => {
      state.artboards = action.payload;
    })
    .addCase(setSelectedArtboard, (state, action) => {
      state.selectedArtboard = action.payload;
    });
});

export default appReducer;
