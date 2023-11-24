import { all } from 'redux-saga/effects';
import historySaga from '../modules/history/saga';
import applicationSaga from '../modules/app/saga';

export default function* rootSaga() {
	yield all([historySaga(), applicationSaga()]);
}
