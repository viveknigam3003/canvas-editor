import { createAction } from '@reduxjs/toolkit';
import { Artboard } from '../../types';
import { ApplicationState } from './reducer';

export enum ApplicationActionType {
	APP_START = 'app/appStart',
	INIT_STATE = 'app/initState',
	ADD_ARTBOARD = 'app/addArtboard',
	SET_ARTBOARDS = 'app/setArtboards',
	UPDATE_ARTBOARDS = 'app/updateArtboards',
	SET_ACTIVE_ARTBOARD = 'app/setActiveArtboard',
	UPDATE_ACTIVE_ARTBOARD = 'app/updateActiveArtboard',
	UPDATE_ACTIVE_ARTBOARD_LAYERS = 'app/updateActiveArtboardLayers',
	SET_SELECTED_ARTBOARDS = 'app/setSelectedArtboards',
	UPDATE_SELECTED_ARTBOARDS = 'app/updateSelectedArtboards',
	APPLY_BULK_EDIT = 'app/applyBulkEdit',
	SET_ZOOM = 'app/setZoom',
}

export const appStart = createAction(ApplicationActionType.APP_START);

export const initState = createAction<Partial<Record<keyof ApplicationState, any>>>(ApplicationActionType.INIT_STATE);

export const addArtboard = createAction<{ artboard: Artboard; state: Record<string, any> }>(
	ApplicationActionType.ADD_ARTBOARD,
);

export const setArtboards = createAction<Array<Artboard>>(ApplicationActionType.SET_ARTBOARDS);

export const updateArtboards = createAction<Array<Artboard>>(ApplicationActionType.UPDATE_ARTBOARDS);

export const setActiveArtboard = createAction<Artboard>(ApplicationActionType.SET_ACTIVE_ARTBOARD);

export const updateActiveArtboard = createAction<Artboard>(ApplicationActionType.UPDATE_ACTIVE_ARTBOARD);

export const updateActiveArtboardLayers = createAction<Array<fabric.Object>>(
	ApplicationActionType.UPDATE_ACTIVE_ARTBOARD_LAYERS,
);

export const setSelectedArtboards = createAction<Array<string>>(ApplicationActionType.SET_SELECTED_ARTBOARDS);

export const updateSelectedArtboards = createAction<Array<string>>(ApplicationActionType.UPDATE_SELECTED_ARTBOARDS);

export const applyBulkEdit = createAction<{
	element: fabric.Object;
	properties: Record<string, any>;
}>(ApplicationActionType.APPLY_BULK_EDIT);

export const setZoomLevel = createAction<number>(ApplicationActionType.SET_ZOOM);
