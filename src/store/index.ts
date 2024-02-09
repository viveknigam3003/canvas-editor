import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import rootReducer from './rootReducer';
import rootSaga from './rootSaga';
import { createClient } from '@liveblocks/client';
import { liveblocksEnhancer } from '@liveblocks/redux';

const sagaMiddleware = createSagaMiddleware();

export const client = createClient({
	publicApiKey: import.meta.env.VITE_LIVEBLOCKS_KEY,
	throttle: 120,
});

const store = configureStore({
	reducer: rootReducer,
	middleware: getDefaultMiddleware => getDefaultMiddleware({ serializableCheck: false }).concat(sagaMiddleware),
	enhancers: [
		liveblocksEnhancer({
			client,
			// @ts-ignore
			presenceMapping: { collaboration: true },
			storageMapping: { app: true },
		}),
	],
});

sagaMiddleware.run(rootSaga);

export default store;
