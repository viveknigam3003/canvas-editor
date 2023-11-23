import { createReducer } from '@reduxjs/toolkit';
import { setRedoable, setUndoable, updatePointer, updateStateHistory } from './actions';
import deepDiff from 'deep-diff';
import { Artboard } from '../../types';

export interface Delta {
	actionType: string;
	diff: deepDiff.Diff<Artboard[], any>[];
}

interface HistoryState {
	deltas: Delta[];
	currentIndex: number;
	undoable: boolean;
	redoable: boolean;
}

const initialState: HistoryState = {
	deltas: [],
	currentIndex: -1,
	undoable: false,
	redoable: false,
};

const historyReducer = createReducer(initialState, builder => {
	return builder
		.addCase(updateStateHistory, (state, action) => {
			state.deltas = action.payload;
		})
		.addCase(updatePointer, (state, action) => {
			state.currentIndex = action.payload;
		})
		.addCase(setUndoable, (state, action) => {
			state.undoable = action.payload;
		})
		.addCase(setRedoable, (state, action) => {
			state.redoable = action.payload;
		});
});

export default historyReducer;
