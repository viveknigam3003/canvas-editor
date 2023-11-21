import { Action } from "@reduxjs/toolkit";
import { call, put, takeEvery } from "redux-saga/effects";
import { appStart, initState, setArtboards } from "./actions";

function* initStateSaga() {
  const savedState: string = yield call([localStorage, "getItem"], "artboards");
  const initialState = savedState ? JSON.parse(savedState) : undefined;

  yield put(initState(initialState));
}

function* setArtboardsSaga(action: Action) {
  if (!setArtboards.match(action)) {
    return;
  }

  const artboards = action.payload;
  const serializedState = JSON.stringify(artboards);
  yield call([localStorage, "setItem"], "artboards", serializedState);
  // Save the difference between the current state and the previous state in history redux
  console.log("setArtboardsSaga");
}

function* applicationSaga() {
  yield takeEvery(appStart.type, initStateSaga);
  yield takeEvery(setArtboards.type, setArtboardsSaga);
}

export default applicationSaga;
