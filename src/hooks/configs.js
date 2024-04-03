// This is subscribe APIs.

import {useEffect, useRef} from 'react';
import {useDispatch} from 'react-redux';

import {debugLog} from '../libs/log';
import {getConfigs} from '../libs/services';
import {setType} from '../reducers/config';

export const useGetConfigs = () => {
	const ref = useRef(null);
	const dispatch = useDispatch();

	useEffect(() => {
		if (!ref.current) {
			debugLog('LUNA_CONFIG', {}, 'call useConfigs');
			ref.current = getConfigs({
				parameters: {
					subscribe: true,
					configNames: ['com.webos.service.rollingscreen.supportScreenType']
				},
				onSuccess: res => {
					debugLog('LUNA_CONFIG', res, 'Success');
					if (res.configs) {
						dispatch(
							setType(
								res.configs['com.webos.service.rollingscreen.supportScreenType']
							)
						);
					} else {
						dispatch(setType('undefined'));
					}
				},
				onFailure: err => {
					debugLog('LUNA_CONFIG', err, 'Fail');
					dispatch(setType('luna error'));
				}
			});
		}

		return () => {
			if (ref.current) {
				ref.current.cancel();
				ref.current = null;
			}
		};
	}, [dispatch]);
};
