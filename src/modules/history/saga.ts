import { Action } from "@reduxjs/toolkit";
import { put, select, takeEvery } from "redux-saga/effects";
import { Artboard } from "../../App";
import { RootState } from "../../store/rootReducer";
import { setArtboards } from "../app/actions";
import { updateStateHistory } from "./actions";
import { Delta } from "./reducer";
import { diffArrays } from "diff";
import deepDiff from "deep-diff";

export function* observeStateChanges(action: Action) {
  if (!setArtboards.match(action)) {
    return;
  }

  // Whenever setArtboards is dispatched, save the difference between the current state and the previous state in history redux
  const previousState: Array<Artboard> = yield select(
    (state: RootState) => state.app.artboards
  );

  const currentState: Array<Artboard> = action.payload;

  console.log("previousState", previousState);
  console.log("currentState", currentState);
  const diff = diffArrays(previousState, currentState);
  const diffWithDeepDiff = deepDiff.diff(
    { diff: previousState },
    { diff: currentState }
  );

  console.log("diff", diff);
  console.log("diffWithDeepDiff", diffWithDeepDiff);

  if (!diff) {
    console.log("no diff");
    return;
  }

  const delta: Delta = {
    actionType: setArtboards.type,
    diff,
  };

  yield put(updateStateHistory(delta));
}

function* historySaga() {
  yield takeEvery(setArtboards.type, observeStateChanges);
}

export default historySaga;
