import { createAction } from '@reduxjs/toolkit';

export enum CollaborationActionType {
	SET_CURSOR = 'collaboration/setCursor',
}

export const setCursor = createAction<{ x: number; y: number }>('collaboration/setCursor');
