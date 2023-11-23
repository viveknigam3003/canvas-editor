import { createReducer } from '@reduxjs/toolkit';
import { initState, updateArtboards } from './actions';
import { Artboard } from '../../types';

export interface ApplicationState {
	artboards: Array<Artboard>;
}

const initialState: ApplicationState = {
	artboards: [],
};

const appReducer = createReducer(initialState, builder => {
	return builder
		.addCase(initState, (state, action) => {
			state.artboards = action.payload;
		})
		.addCase(updateArtboards, (state, action) => {
			state.artboards = action.payload;
		});
});

export default appReducer;
