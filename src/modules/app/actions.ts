import { createAction } from '@reduxjs/toolkit';
import { Artboard } from '../../types';
import { ApplicationState } from './reducer';

export enum ApplicationActionType {
	APP_START = 'app/appStart',
	INIT_STATE = 'app/initState',
	SET_ARTBOARDS = 'app/setArtboards',
	UPDATE_ARTBOARDS = 'app/updateArtboards',
	SET_SELECTED_ARTBOARD = 'app/setSelectedArtboard',
	UPDATE_SELECTED_ARTBOARD = 'app/updateSelectedArtboard',
}

export const appStart = createAction(ApplicationActionType.APP_START);

export const initState = createAction<Partial<Record<keyof ApplicationState, any>>>(ApplicationActionType.INIT_STATE);

export const setArtboards = createAction<Array<Artboard>>(ApplicationActionType.SET_ARTBOARDS);

export const updateArtboards = createAction<Array<Artboard>>(ApplicationActionType.UPDATE_ARTBOARDS);

export const setSelectedArtboard = createAction<Artboard>(ApplicationActionType.SET_SELECTED_ARTBOARD);

export const updateSelectedArtboard = createAction<Artboard>(ApplicationActionType.UPDATE_SELECTED_ARTBOARD);
