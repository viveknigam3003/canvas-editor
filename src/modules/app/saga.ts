import { Action } from '@reduxjs/toolkit';
import deepDiff from 'deep-diff';
import { call, put, select, takeEvery } from 'redux-saga/effects';
import { RootState } from '../../store/rootReducer';
import { Artboard } from '../../types';
import { updatePointer, updateStateHistory } from '../history/actions';
import { Delta } from '../history/reducer';
import { recordChanges } from '../history/saga';
import {
	appStart,
	initState,
	setArtboards,
	setSelectedArtboard,
	updateArtboards,
	updateSelectedArtboard,
} from './actions';
import { ApplicationState } from './reducer';

function* initStateSaga() {
	const savedState: string = yield call([localStorage, 'getItem'], 'artboards');

	const artboards: Artboard[] = savedState ? JSON.parse(savedState) : [];

	if (artboards.length === 0) {
		// Set state to local storage
		const serializedState = JSON.stringify(artboards);
		yield call([localStorage, 'setItem'], 'artboards', serializedState);
	}

	yield put(
		initState({
			artboards,
			selectedArtboard: artboards[0] ?? null,
		}),
	);

	// Save the initial state in history redux
	const diff = deepDiff.diff({} as ApplicationState, { artboards });

	if (!diff) {
		console.log('no diff');
		return;
	}

	const delta: Delta = {
		actionType: appStart.type,
		key: 'app.artboards',
		diff,
	};
	yield put(updateStateHistory([delta]));
	yield put(updatePointer(0));
}

function* setArtboardsSaga(action: Action) {
	if (!setArtboards.match(action)) {
		return;
	}

	const previousState: string = yield call([localStorage, 'getItem'], 'artboards');
	const nextState: Artboard[] = action.payload;

	const serializedState = JSON.stringify(nextState);
	yield call([localStorage, 'setItem'], 'artboards', serializedState);
	// Save the difference between the current state and the previous state in history redux
	yield put(updateArtboards(action.payload));
	yield recordChanges({
		previousState: JSON.parse(previousState),
		nextState,
		action: updateArtboards(action.payload),
		key: 'app.artboards',
	});
}

function* setSelectedArtboardSaga(action: Action) {
	if (!setSelectedArtboard.match(action)) {
		return;
	}

	const previousState: Artboard = yield select((state: RootState) => state.app.selectedArtboard);
	const nextState: Artboard = action.payload;

	yield put(updateSelectedArtboard(action.payload));
	yield recordChanges({
		previousState,
		nextState,
		action: updateSelectedArtboard(action.payload),
		key: 'app.selectedArtboard',
	});
}

function* applicationSaga() {
	yield takeEvery(appStart.type, initStateSaga);
	yield takeEvery(setArtboards.type, setArtboardsSaga);
	yield takeEvery(setSelectedArtboard.type, setSelectedArtboardSaga);
}

export default applicationSaga;
