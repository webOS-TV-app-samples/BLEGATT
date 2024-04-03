import {useMemo} from 'react';
import $L from '@enact/i18n/$L';

export const useMainStrings = () => {
	return useMemo(() => {
		return {
			main: $L('This is a main page of sample application.'),
			ok: $L('OK'),
			open: $L('Open'),
			alert: $L('This is an alert message.'),
			next: $L('Next')
		};
	}, []);
};
