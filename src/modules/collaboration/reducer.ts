import { createReducer } from '@reduxjs/toolkit';
import { setCursor } from './actions';

interface CollaborationState {
	cursor: { x: number; y: number };
}

const initialState: CollaborationState = {
	cursor: { x: 0, y: 0 },
};

export const collaborationReducer = createReducer(initialState, builder => {
	builder.addCase(setCursor, (state, action) => {
		state.cursor = action.payload;
	});
});
