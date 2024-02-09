import { combineReducers } from 'redux';
import historyReducer from '../modules/history/reducer';
import appReducer from '../modules/app/reducer';
import { collaborationReducer } from '../modules/collaboration/reducer';

export interface RootState {
	app: ReturnType<typeof appReducer>;
	history: ReturnType<typeof historyReducer>;
	collaboration: ReturnType<typeof collaborationReducer>;
}

const rootReducer = combineReducers({
	app: appReducer,
	history: historyReducer,
	collaboration: collaborationReducer,
});

export default rootReducer;
