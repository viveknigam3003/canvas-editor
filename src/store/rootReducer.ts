import { combineReducers } from 'redux';
import historyReducer from '../modules/history/reducer';
import appReducer from '../modules/app/reducer';

export interface RootState {
	app: ReturnType<typeof appReducer>;
	history: ReturnType<typeof historyReducer>;
}

const rootReducer = combineReducers({
	app: appReducer,
	history: historyReducer,
});

export default rootReducer;
