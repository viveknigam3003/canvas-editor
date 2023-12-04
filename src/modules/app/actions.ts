import { createAction } from '@reduxjs/toolkit';
import { Artboard } from '../../types';

export enum ApplicationActionType {
	APP_START = 'app/appStart',
	INIT_STATE = 'app/initState',
	SET_ARTBOARDS = 'app/setArtboards',
	UPDATE_ARTBOARDS = 'app/updateArtboards',
	UPDATE_ACTIVE_ARTBOARD_LAYERS = 'app/updateActiveArtboardLayers',
}

export const appStart = createAction(ApplicationActionType.APP_START);

export const initState = createAction<Artboard[]>(ApplicationActionType.INIT_STATE);

export const setArtboards = createAction<Array<Artboard>>(ApplicationActionType.SET_ARTBOARDS);

export const updateArtboards = createAction<Array<Artboard>>(ApplicationActionType.UPDATE_ARTBOARDS);

export const updateActiveArtboardLayers = createAction<Array<fabric.Object>>(
	ApplicationActionType.UPDATE_ACTIVE_ARTBOARD_LAYERS,
);
