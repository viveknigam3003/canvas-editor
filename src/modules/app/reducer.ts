import { createReducer } from '@reduxjs/toolkit';
import { initState, updateArtboards, updateActiveArtboardLayers } from './actions';
import { Artboard } from '../../types';

export interface ApplicationState {
	artboards: Array<Artboard>;
	activeArtboardLayers: Array<any>;
}

const initialState: ApplicationState = {
	artboards: [],
	activeArtboardLayers: [],
};

const appReducer = createReducer(initialState, builder => {
	return builder
		.addCase(initState, (state, action) => {
			state.artboards = action.payload;
		})
		.addCase(updateArtboards, (state, action) => {
			state.artboards = action.payload;
		})
		.addCase(updateActiveArtboardLayers, (state, action) => {
			state.activeArtboardLayers = action.payload;
		});
});

export default appReducer;
