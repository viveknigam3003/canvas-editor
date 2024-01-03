import { Action } from '@reduxjs/toolkit';
import deepDiff from 'deep-diff';
import { put, select, takeEvery } from 'redux-saga/effects';
import { RootState } from '../../store/rootReducer';
import { ApplicationState } from '../app/reducer';
import { redo, setRedoable, setUndoable, undo, updatePointer, updateStateHistory } from './actions';
import { Delta } from './reducer';
import { Artboard } from '../../types';
import { ApplicationActionType } from '../app/actions';

export function* recordChanges({
	previousState,
	nextState,
	action,
	key,
}: {
	previousState: any;
	nextState: any;
	action: Action;
	key: string;
}) {
	console.debug('previousState', previousState);
	console.debug('nextState', nextState);

	const diff = deepDiff.diff(previousState, nextState);

	if (!diff) {
		console.debug('no diff');
		return;
	}

	console.debug('Diff found', diff);
	const delta: Delta = {
		actionType: action.type,
		key,
		diff,
	};

	// Update the state history with the new delta on the next index
	const currentIndex: number = yield select((state: RootState) => state.history.currentIndex);
	const deltas: Array<Delta> = yield select((state: RootState) => state.history.deltas);
	// Remove all the deltas after the current index and replace them with the new delta (don't mutate the array)
	const deltasToKeep = deltas.slice(0, currentIndex + 1);
	const newDeltas = [...deltasToKeep, delta];

	yield put(updatePointer(currentIndex + 1));

	yield put(updateStateHistory(newDeltas));

	const undoable: boolean = yield select((state: RootState) => state.history.undoable);
	const redoable: boolean = yield select((state: RootState) => state.history.redoable);

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

function getReverseDiff(diff: Array<deepDiff.Diff<ApplicationState, ApplicationState>>) {
	if (!diff || diff.length === 0) {
		return diff;
	}

	// Reverse the diff
	const newDiff: any = diff.map(d => {
		switch (d.kind) {
			case 'N': {
				return {
					...d,
					kind: 'D',
				};
			}
			case 'D': {
				return {
					...d,
					kind: 'N',
				};
			}
			case 'E': {
				return {
					...d,
					lhs: d.rhs,
					rhs: d.lhs,
				};
			}
			case 'A': {
				if (d.item) {
					// For array insertions (N), change them to deletions (D)
					if (d.item.kind === 'N') {
						return { ...d, item: { ...d.item, kind: 'D' } };
					}
					// For array deletions (D), change them to insertions (N)
					else if (d.item.kind === 'D') {
						return { ...d, item: { ...d.item, kind: 'N' } };
					}
					// For array edits (E), swap lhs and rhs
					else if (d.item.kind === 'E') {
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

	const deltas: Array<Delta> = yield select((state: RootState) => state.history.deltas);
	const currentIndex: number = yield select((state: RootState) => state.history.currentIndex);
	// Take the item at the currentIndex pointer and apply the inverse of the diff to the current state
	const delta = deltas[currentIndex];

	if (!delta) {
		return;
	}

	const keys = delta.key.split('.');
	// If the key is app.artboards, then we need select state.app.artboards
	const state: ApplicationState = yield select((state: RootState) => {
		let currentState: any = state;
		for (const key of keys) {
			currentState = currentState[key as keyof ApplicationState];
		}

		return currentState;
	});
	const stateCopy: any = JSON.parse(JSON.stringify(state));

	const reverseDiff = getReverseDiff(delta.diff);

	// Apply the reverseDiff to the current state
	for (const d of reverseDiff) {
		deepDiff.applyChange(stateCopy, true, d);
	}

	yield put({ type: delta.actionType, payload: stateCopy });

	// Special case for handling selected artboard canvas updates.
	if (delta.actionType === ApplicationActionType.UPDATE_ARTBOARDS) {
		const activeArtboard: Artboard = yield select((state: RootState) => state.app.activeArtboard);
		const updatedActiveArtboard = stateCopy.find((a: Artboard) => a.id === activeArtboard?.id);
		if (activeArtboard) {
			yield put({ type: ApplicationActionType.UPDATE_ACTIVE_ARTBOARD, payload: updatedActiveArtboard });
		}
	}
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
	const currentIndex: number = yield select((state: RootState) => state.history.currentIndex);

	// If the current pointer is at the end of the array, then there is nothing to redo
	const deltas: Array<Delta> = yield select((state: RootState) => state.history.deltas);

	// Take the item at the currentIndex pointer and apply the diff to the current state
	const delta = deltas[currentIndex + 1];

	if (!delta) {
		return;
	}

	const keys = delta.key.split('.');
	// If the key is app.artboards, then we need select state.app.artboards
	const state: ApplicationState = yield select((state: RootState) => {
		let currentState: any = state;
		for (const key of keys) {
			currentState = currentState[key as keyof ApplicationState];
		}

		return currentState;
	});
	const stateCopy: any = JSON.parse(JSON.stringify(state));

	// Apply the diff to the current state
	for (const d of delta.diff) {
		deepDiff.applyChange(stateCopy, true, d);
	}

	yield put({ type: delta.actionType, payload: stateCopy });

	// Special case for handling selected artboard canvas updates.
	if (delta.actionType === ApplicationActionType.UPDATE_ARTBOARDS) {
		const activeArtboard: Artboard = yield select((state: RootState) => state.app.activeArtboard);
		const updatedActiveArtboard = stateCopy.find((a: Artboard) => a.id === activeArtboard?.id);
		if (activeArtboard) {
			yield put({ type: ApplicationActionType.UPDATE_ACTIVE_ARTBOARD, payload: updatedActiveArtboard });
		}
	}
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
	// yield takeEvery([setArtboards.type, setSelectedArtboard.type], observeStateChanges);
	yield takeEvery(undo.type, undoSaga);
	yield takeEvery(redo.type, redoSaga);
}

export default historySaga;
