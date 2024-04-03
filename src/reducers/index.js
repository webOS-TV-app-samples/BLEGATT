import {combineReducers} from 'redux';

import blegatt from './blegatt';
import general from './general';
import config from './config';
import panel from './panel';
import userList from './userList';

export default combineReducers({
	blegatt,
	general,
	config,
	panel,
	userList
});
