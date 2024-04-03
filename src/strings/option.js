import {useMemo} from 'react';
import $L from '@enact/i18n/$L';

export const useOptionStrings = () => {
	return useMemo(() => {
		return {
			options: $L('Options'),
			userguide: $L('User Guide'),
			quit: $L('Quit App')
		};
	}, []);
};
