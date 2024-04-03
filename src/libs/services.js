import request from '../libs/request';

const cfg = request('luna://com.webos.service.config');
export const getConfigs = params => cfg({method: 'getConfigs', ...params});

const sam = request('luna://com.webos.applicationManager');
export const launch = parameters => sam({method: 'launch', parameters});

const blegatt = request('luna://com.webos.service.blegatt');
export const isEnabled = params => blegatt({method: 'isEnabled', ...params});
export const getState = params => blegatt({method: 'getState', ...params});
export const startScan = params => blegatt({method: 'startScan', ...params});
export const stopScan = parameters => blegatt({method: 'stopScan', parameters});
export const pair = parameters => blegatt({method: 'pair', parameters});
export const unpair = parameters => blegatt({method: 'unpair', parameters});
export const connect = params => blegatt({method: 'client/connect', ...params});
export const disconnect = parameters =>
	blegatt({method: 'client/disconnect', parameters});
export const discoverServices = parameters =>
	blegatt({method: 'client/discoverServices', parameters});
export const getServices = parameters =>
	blegatt({method: 'client/getServices', parameters});
export const setCharacteristicNotification = parameters =>
	blegatt({method: 'client/setCharacteristicNotification', parameters});
export const readCharacteristic = parameters =>
	blegatt({method: 'client/readCharacteristic', parameters});
export const writeCharacteristic = parameters =>
	blegatt({method: 'client/writeCharacteristic', parameters});
export const readDescriptor = parameters =>
	blegatt({method: 'client/readDescriptor', parameters});
export const writeDescriptor = parameters =>
	blegatt({method: 'client/writeDescriptor', parameters});
