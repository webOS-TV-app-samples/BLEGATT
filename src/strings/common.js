import {useMemo} from 'react';
import $L from '@enact/i18n/$L';

export const useCommonStrings = () => {
	return useMemo(() => {
		return {
			title: $L('Enact Template')
		};
	}, []);
};
