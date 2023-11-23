import { Action } from "@reduxjs/toolkit";
import deepDiff from "deep-diff";
import { put, select, takeEvery } from "redux-saga/effects";
import { RootState } from "../../store/rootReducer";
import { Artboard } from "../../types";
import { setArtboards, setSelectedArtboard, updateArtboards } from "../app/actions";
import {
  redo,
  setRedoable,
  setUndoable,
  undo,
  updatePointer,
  updateStateHistory,
} from "./actions";
import { Delta } from "./reducer";

const trackedActions = [setArtboards, setSelectedArtboard];

export function* observeStateChanges(action: Action) {
  // If the action is not one of the tracked actions, then do nothing
  if (!trackedActions.includes(action.type)) {
    return;
  }

  // Whenever setArtboards is dispatched, save the difference between the current state and the previous state in history redux
  const previousState: Array<Artboard> = yield select(
    (state: RootState) => state.app
  );
  const currentState: Array<Artboard> = (action as any).payload;
  const diff = deepDiff.diff(previousState, currentState);

  if (!diff) {
    console.debug("no diff");
    return;
  }

  console.debug("Diff found", diff);
  const delta: Delta = {
    actionType: setArtboards.type,
    diff,
  };

  // Update the state history with the new delta on the next index
  const currentIndex: number = yield select(
    (state: RootState) => state.history.currentIndex
  );
  const deltas: Array<Delta> = yield select(
    (state: RootState) => state.history.deltas
  );
  // Remove all the deltas after the current index and replace them with the new delta (don't mutate the array)
  const deltasToKeep = deltas.slice(0, currentIndex + 1);
  const newDeltas = [...deltasToKeep, delta];

  yield put(updatePointer(currentIndex + 1));

  yield put(updateStateHistory(newDeltas));

  const undoable: boolean = yield select(
    (state: RootState) => state.history.undoable
  );
  const redoable: boolean = yield select(
    (state: RootState) => state.history.redoable
  );

  if (!undoable) {
    yield put(setUndoable(true));
  }

  // Decide if the user can redo or not based on the current index and the new deltas length
  if (redoable) {
    if (currentIndex + 1 === newDeltas.length - 1) {
      yield put(setRedoable(false));
    }
  } else if (currentIndex < deltas.length - 1) {
    yield put(setRedoable(true));
  }
}

function getReverseDiff(diff: Array<deepDiff.Diff<Artboard[], Artboard[]>>) {
  if (!diff || diff.length === 0) {
    return diff;
  }

  // Reverse the diff
  const newDiff: any = diff.map((d) => {
    switch (d.kind) {
      case "N": {
        return {
          ...d,
          kind: "D",
        };
      }
      case "D": {
        return {
          ...d,
          kind: "N",
        };
      }
      case "E": {
        return {
          ...d,
          lhs: d.rhs,
          rhs: d.lhs,
        };
      }
      case "A": {
        if (d.item) {
          // For array insertions (N), change them to deletions (D)
          if (d.item.kind === "N") {
            return { ...d, item: { ...d.item, kind: "D" } };
          }
          // For array deletions (D), change them to insertions (N)
          else if (d.item.kind === "D") {
            return { ...d, item: { ...d.item, kind: "N" } };
          }
          // For array edits (E), swap lhs and rhs
          else if (d.item.kind === "E") {
            return {
              ...d,
              item: { ...d.item, lhs: d.item.rhs, rhs: d.item.lhs },
            };
          }
        }
        break;
      }
    }
  });

  return newDiff;
}

function* undoSaga() {
  if (!undo.match) {
    return;
  }

  const artboards: Artboard[] = yield select(
    (state: RootState) => state.app.artboards
  );
  const artboardCopy: Artboard[] = JSON.parse(JSON.stringify(artboards));
  const deltas: Array<Delta> = yield select(
    (state: RootState) => state.history.deltas
  );
  const currentIndex: number = yield select(
    (state: RootState) => state.history.currentIndex
  );

  // Take the item at the currentIndex pointer and apply the inverse of the diff to the current state
  const delta = deltas[currentIndex];
  const reverseDiff = getReverseDiff(delta.diff);

  // Apply the reverseDiff to the current state
  for (const d of reverseDiff) {
    deepDiff.applyChange(artboardCopy, true, d);
  }

  yield put(updateArtboards(artboardCopy));
  yield put(updatePointer(Math.max(currentIndex - 1, 0)));

  // Set undoable flag based on if the user can undo or not
  const newPointer = Math.max(currentIndex - 1, 0);

  if (newPointer <= 0) {
    yield put(setUndoable(false));
  }

  if (newPointer < deltas.length - 1) {
    yield put(setRedoable(true));
  }
}

function* redoSaga() {
  if (!redo.match) {
    return;
  }

  // Check where the current pointer is
  const currentIndex: number = yield select(
    (state: RootState) => state.history.currentIndex
  );

  // If the current pointer is at the end of the array, then there is nothing to redo
  const deltas: Array<Delta> = yield select(
    (state: RootState) => state.history.deltas
  );

  // Take the item at the currentIndex pointer and apply the diff to the current state
  const delta = deltas[currentIndex + 1];
  const artboards: Artboard[] = yield select(
    (state: RootState) => state.app.artboards
  );
  const artboardCopy: Artboard[] = JSON.parse(JSON.stringify(artboards));

  // Apply the diff to the current state
  for (const d of delta.diff) {
    deepDiff.applyChange(artboardCopy, true, d);
  }

  yield put(updateArtboards(artboardCopy));
  yield put(updatePointer(Math.min(currentIndex + 1, deltas.length - 1)));

  const newPointer = Math.min(currentIndex + 1, deltas.length - 1);

  if (newPointer >= deltas.length - 1) {
    yield put(setRedoable(false));
  }

  if (newPointer > 0) {
    yield put(setUndoable(true));
  }
}

function* historySaga() {
  yield takeEvery(setArtboards.type, observeStateChanges);
  yield takeEvery(undo.type, undoSaga);
  yield takeEvery(redo.type, redoSaga);
}

export default historySaga;
