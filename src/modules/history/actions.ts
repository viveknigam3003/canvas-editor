import { createAction } from '@reduxjs/toolkit';
import { Delta } from './reducer';

export enum CanvasHistoryActionType {
	UPDATE_STATE_HISTORY = 'history/updateStateHistory',
	UNDO = 'history/undo',
	REDO = 'history/redo',
	UPDATE_POINTER = 'history/updatePointer',
	SET_UNDOABLE = 'history/setUndoable',
	SET_REDOABLE = 'history/setRedoable',
}

export const updateStateHistory = createAction<Delta[]>(CanvasHistoryActionType.UPDATE_STATE_HISTORY);

export const undo = createAction(CanvasHistoryActionType.UNDO);

export const redo = createAction(CanvasHistoryActionType.REDO);

export const updatePointer = createAction<number>(CanvasHistoryActionType.UPDATE_POINTER);

export const setUndoable = createAction<boolean>(CanvasHistoryActionType.SET_UNDOABLE);

export const setRedoable = createAction<boolean>(CanvasHistoryActionType.SET_REDOABLE);
