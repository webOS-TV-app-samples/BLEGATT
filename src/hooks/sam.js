// This is calling APIs

import {useCallback} from 'react';

import {debugLog} from '../libs/log';
import * as services from '../libs/services';

export const useLaunch = () => {
	return useCallback(id => {
		debugLog('LAUNCH[R]', {id});

		if (id) {
			services
				.launch(id)
				.then(res => {
					debugLog('LAUNCH[S]', res);
				})
				.catch(err => {
					debugLog('LAUNCH[F]', err);
				});
		}
	}, []);
};
