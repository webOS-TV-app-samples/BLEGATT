import {inspect} from 'util';
import {info} from '@enact/webos/pmloglib';

import {isBrowser, isTVBrowser} from './utils';

export const debugLog = (msgId, kvPairs, ...msg) => {
	// See the following pages for PmLog
	// https://www.webosose.org/docs/guides/development/logging/formatting-logs/pmloglib-overview/
	// https://www.webosose.org/docs/guides/development/logging/formatting-logs/using-pmloglib-in-nodejs/
	if (!isBrowser()) return;

	const id = `${msgId}`;

	if (isTVBrowser()) {
		// The total length of kvPairs and ...msg should be less than 900 to print pmLog
		const chunkSize = 900;
		const strKvPairs = JSON.stringify(kvPairs);
		const strArrayMsg = msg.map(
			(v, i) => (i === 0 ? '' : ' ') + (typeof v === 'string' ? v : inspect(v))
		);

		if (strKvPairs.length + strArrayMsg.toString().length < chunkSize) {
			info(id, kvPairs, strArrayMsg);
		} else {
			let string = strKvPairs + ' ' + strArrayMsg.toString();

			while (string.length > 0) {
				info(id, {}, string.substring(0, chunkSize));
				string = string.substring(chunkSize, string.length);
			}
		}
	}

	if (['development', 'test'].includes(process.env.NODE_ENV)) {
		// eslint-disable-next-line no-console
		console.log(id, kvPairs, ...msg);
	}
};

// msgId should have 'NL_' prefix.
export const normalLog = (msgId, values) => {
	if (!isBrowser()) return;

	const id = `${msgId}`;

	if (isTVBrowser()) {
		info(id, values, '');
	}

	if (['development', 'test'].includes(process.env.NODE_ENV)) {
		// eslint-disable-next-line no-console
		console.log(id, values);
	}
};
