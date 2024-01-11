import { Action } from '@reduxjs/toolkit';
import deepDiff from 'deep-diff';
import { call, debounce, put, select, takeEvery } from 'redux-saga/effects';
import { RootState } from '../../store/rootReducer';
import { Artboard } from '../../types';
import { updatePointer, updateStateHistory } from '../history/actions';
import { Delta } from '../history/reducer';
import { recordChanges } from '../history/saga';
import {
	addArtboard,
	appStart,
	applyBulkEdit,
	initState,
	setActiveArtboard,
	setArtboards,
	setSelectedArtboards,
	updateActiveArtboard,
	updateArtboards,
	updateSelectedArtboards,
} from './actions';
import { ApplicationState } from './reducer';
import { getBulkEditedArtboards } from './bulkEdit';
import { filterSaveExcludes } from '../utils/fabricObjectUtils';
import { loadFontsFromArtboards } from './FontLoader';

function* initStateSaga() {
	const savedState: string = yield call([localStorage, 'getItem'], 'artboards');

	const artboards: Artboard[] = savedState ? JSON.parse(savedState) : [];

	if (artboards.length === 0) {
		// Set state to local storage
		const serializedState = JSON.stringify(artboards);
		yield call([localStorage, 'setItem'], 'artboards', serializedState);
	}

	// Load fonts from artboards
	try {
		yield call(loadFontsFromArtboards, artboards);
	} catch (error) {
		console.error('Error loading fonts:', error);
	}

	yield put(
		initState({
			artboards,
			activeArtboard: artboards[0] ?? null,
			selectedArtboards: [artboards[0]?.id ?? ''],
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

function* setActiveArtboardSaga(action: Action) {
	if (!setActiveArtboard.match(action)) {
		return;
	}

	// const previousState: Artboard = yield select((state: RootState) => state.app.activeArtboard);
	// const nextState: Artboard = action.payload;

	yield put(updateActiveArtboard(action.payload));
	// yield recordChanges({
	// 	previousState,
	// 	nextState,
	// 	action: updateActiveArtboard(action.payload),
	// 	key: 'app.activeArtboard',
	// });
}

function* setSelectedArtboardsSaga(action: Action) {
	if (!setSelectedArtboards.match(action)) {
		return;
	}

	// const previousState: string[] = yield select((state: RootState) => state.app.selectedArtboards);
	// const nextState: string[] = action.payload;

	yield put(updateSelectedArtboards(action.payload));
}

function* applyBulkEditSaga(action: Action) {
	if (!applyBulkEdit.match(action)) {
		return;
	}

	const { element, properties } = action.payload;

	const previousState: Artboard[] = yield select((state: RootState) => state.app.artboards);
	const selectedArtboards: string[] = yield select((state: RootState) => state.app.selectedArtboards);
	const nextState: Artboard[] = getBulkEditedArtboards(element.data.id, properties, {
		artboards: previousState,
		selectedArtboards,
	});

	yield put(setArtboards(nextState));
}

function* addArtboardSaga(action: Action) {
	if (!addArtboard.match(action)) {
		return;
	}

	const { artboard, state } = action.payload;
	const currentArtboards: Artboard[] = yield select((state: RootState) => state.app.artboards);
	const filteredObjects = filterSaveExcludes(state?.objects);
	const updatedArtboards = [
		...currentArtboards,
		{
			...artboard,
			state: {
				...state,
				objects: filteredObjects,
			},
		},
	];
	yield put(setArtboards(updatedArtboards));
	yield put(setActiveArtboard(artboard));
	yield put(setSelectedArtboards([artboard.id]));
}

function* applicationSaga() {
	yield takeEvery(appStart.type, initStateSaga);
	yield takeEvery(setArtboards.type, setArtboardsSaga);
	yield takeEvery(setActiveArtboard.type, setActiveArtboardSaga);
	yield takeEvery(setSelectedArtboards.type, setSelectedArtboardsSaga);
	yield debounce(500, applyBulkEdit.type, applyBulkEditSaga);
	yield takeEvery(addArtboard.type, addArtboardSaga);
}

export default applicationSaga;
