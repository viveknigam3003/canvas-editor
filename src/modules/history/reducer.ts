import { createReducer } from "@reduxjs/toolkit";
import { updateStateHistory } from "./actions";

export interface Delta {
  actionType: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  diff: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  };
}

interface HistoryState {
  deltas: Delta[];
  currentIndex: number;
}

const initialState: HistoryState = {
  deltas: [],
  currentIndex: -1,
};

const historyReducer = createReducer(initialState, (builder) => {
  return builder.addCase(updateStateHistory, (state, action) => {
    state.currentIndex += 1;
    state.deltas = state.deltas.slice(0, state.currentIndex);
    state.deltas.push(action.payload);
  });
});

export default historyReducer;
