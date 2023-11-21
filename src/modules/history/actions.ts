import { createAction } from "@reduxjs/toolkit";
import { Delta } from "./reducer";

export enum CanvasHistoryActionType {
  UPDATE_STATE_HISTORY = "history/updateStateHistory",
}

export const updateStateHistory = createAction<Delta>(
  CanvasHistoryActionType.UPDATE_STATE_HISTORY
);
