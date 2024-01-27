import { createReducer } from '@reduxjs/toolkit';
import { Artboard } from '../../types';
import {
	initState,
	updateActiveArtboardLayers,
	updateArtboards,
	updateActiveArtboard,
	updateSelectedArtboards,
	setZoomLevel,
} from './actions';

export interface ApplicationState {
	zoomLevel: number;
	artboards: Array<Artboard>;
	activeArtboard: Artboard | null;
	activeArtboardLayers: Array<any>;
	selectedArtboards: Array<string>;
}

export const initialState: ApplicationState = {
	zoomLevel: 1,
	activeArtboard: null,
	artboards: [],
	activeArtboardLayers: [],
	selectedArtboards: [],
};

const appReducer = createReducer(initialState, builder => {
	return builder
		.addCase(initState, (state, action) => {
			// Set the initial state of the application for all the keys in the payload
			Object.keys(action.payload).forEach((key: string) => {
				(state as any)[key] = action.payload[key as keyof ApplicationState];
			});
		})
		.addCase(updateArtboards, (state, action) => {
			state.artboards = action.payload;
		})
		.addCase(updateActiveArtboard, (state, action) => {
			state.activeArtboard = action.payload;
		})
		.addCase(updateActiveArtboardLayers, (state, action) => {
			state.activeArtboardLayers = action.payload;
		})
		.addCase(updateSelectedArtboards, (state, action) => {
			state.selectedArtboards = action.payload;
		})
		.addCase(setZoomLevel, (state, action) => {
			state.zoomLevel = action.payload;
		});
});

export default appReducer;
