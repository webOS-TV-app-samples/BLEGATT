import {useCallback, useEffect, useRef} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {debugLog} from '../libs/log';
import * as services from '../libs/services';
import {
	setEnable,
	setStatus,
	setHideDevices,
	setDevices,
	setPairedDevice,
	setDeviceInfo,
	setCharacteristicChanged,
	setCharacteristicRead,
	setDescriptorRead,
	setAlert
} from '../reducers/blegatt';

export const useIsEnabled = () => {
	const ref = useRef(null);
	const dispatch = useDispatch();

	useEffect(() => {
		if (!ref.current) {
			const param = {subscribe: true};
			debugLog('LUNA_BLEGATT', param, 'Call isEnabled API');
			ref.current = services.isEnabled({
				parameters: param,
				onSuccess: res => {
					debugLog('LUNA_BLEGATT', res, 'Success isEnabled API');
					dispatch(setEnable(res.isEnabled));
					dispatch(setStatus());
				},
				onFailure: err => {
					debugLog('LUNA_BLEGATT', err, 'Error isEnabled API');
					dispatch(
						setAlert({
							title: 'Error isEnabled API',
							text: err.errorText,
							type: 'fullscreen',
							open: true
						})
					);
				}
			});
		}

		return () => {
			if (ref.current) {
				debugLog('LUNA_BLEGATT', {}, 'Cancel isEnabled API');
				ref.current.cancel();
				ref.current = null;
			}
		};
	}, [dispatch]);
};

export const useGetState = () => {
	const ref = useRef(null);
	const dispatch = useDispatch();

	useEffect(() => {
		if (!ref.current) {
			const param = {subscribe: true};
			debugLog('LUNA_BLEGATT', param, 'Call getState API');
			ref.current = services.getState({
				parameters: param,
				onSuccess: res => {
					debugLog('LUNA_BLEGATT', res, 'Success getState API');
					if (res.isScan) {
						dispatch(setStatus('scan'));
					} else {
						dispatch(setStatus());
					}

					if (res.pairedDevice) {
						dispatch(setPairedDevice(res.pairedDevice));
					}
				},
				onFailure: err => {
					debugLog('LUNA_BLEGATT', err, 'Error getState API');
					dispatch(setStatus());
					dispatch(
						setAlert({
							title: 'Error getState API',
							text: err.errorText,
							type: 'fullscreen',
							open: true
						})
					);
				}
			});
		}

		return () => {
			if (ref.current) {
				debugLog('LUNA_BLEGATT', {}, 'Cancel getState API');
				ref.current.cancel();
				ref.current = null;
			}
		};
	}, [dispatch]);
};

export const useDevices = () => {
	const devices = useSelector(state => state.blegatt.devices);
	const dispatch = useDispatch();
	const hideDevices = useCallback(() => {
		dispatch(setHideDevices(devices));
	}, [dispatch, devices]);

	return [devices, hideDevices];
};

let startSubscription = null;
let prevRes = {};

export const useStartScan = () => {
	const dispatch = useDispatch();

	return useCallback(
		(filteredByName, uuid) => {
			if (startSubscription) {
				debugLog('LUNA_BLEGATT', {}, 'Cancel startScan API');
				startSubscription.cancel();
				startSubscription = null;
			}

			const param = {subscribe: true};

			if (filteredByName) {
				param.scanType = 'name';
			}

			if (uuid) {
				param.uuid = uuid; // '0000fff1-0000-1000-8000-00805f9b34fb',
			}

			debugLog('LUNA_BLEGATT', param, 'Call startScan API');

			startSubscription = services.startScan({
				parameters: param,
				onSuccess: res => {
					debugLog('LUNA_BLEGATT', {}, 'Success startScan API');
					if (res.devices && JSON.stringify(res) !== JSON.stringify(prevRes)) {
						prevRes = res;
						for (const device of res.devices) {
							if (device.address) {
								dispatch(setDevices({...device}));
							}
						}
					}
				},
				onFailure: err => {
					debugLog('LUNA_BLEGATT', err, 'Error startScan API');
					dispatch(
						setAlert({
							title: 'Error startScan API',
							text: err.errorText,
							type: 'fullscreen',
							open: true
						})
					);
				}
			});
		},
		[dispatch]
	);
};

export const useStopScan = () => {
	const dispatch = useDispatch();

	return useCallback(() => {
		debugLog('LUNA_BLEGATT', {}, 'Call stopScan API');

		services
			.stopScan()
			.then(res => {
				debugLog('LUNA_BLEGATT', res, 'Success stopScan API');

				if (res.returnValue) {
					dispatch(setStatus());
				}

				if (startSubscription) {
					debugLog('LUNA_BLEGATT', {}, 'Cancel startScan API at useStopScan');
					startSubscription.cancel();
					startSubscription = null;
				}
			})
			.catch(err => {
				debugLog('LUNA_BLEGATT', err, 'Error stopScan API');
				dispatch(
					setAlert({
						title: 'Error stopScan API',
						text: err.errorText,
						type: 'fullscreen',
						open: true
					})
				);
			});
	}, [dispatch]);
};

export const usePair = () => {
	const dispatch = useDispatch();

	return useCallback(
		mac => {
			const param = {address: mac};
			debugLog('LUNA_BLEGATT', param, 'Call pair API');

			services
				.pair(param)
				.then(res => {
					debugLog('LUNA_BLEGATT', res, 'Success pair API');
				})
				.catch(err => {
					debugLog('LUNA_BLEGATT', err, 'Error pair API');
					dispatch(
						setAlert({
							title: 'Error pair API',
							text: err.errorText,
							type: 'fullscreen',
							open: true
						})
					);
				});
		},
		[dispatch]
	);
};

export const useUnpair = () => {
	const dispatch = useDispatch();

	return useCallback(
		mac => {
			const param = {address: mac};
			debugLog('LUNA_BLEGATT', param, 'Call unpair API');

			services
				.unpair(param)
				.then(res => {
					debugLog('LUNA_BLEGATT', res, 'Success unpair API');
				})
				.catch(err => {
					debugLog('LUNA_BLEGATT', err, 'Error unpair API');
					dispatch(
						setAlert({
							title: 'Error unpair API',
							text: err.errorText,
							type: 'fullscreen',
							open: true
						})
					);
				});
		},
		[dispatch]
	);
};

let connectSubscription = new Map();

export const useConnect = () => {
	const dispatch = useDispatch();

	return useCallback(
		mac => {
			const param = {subscribe: true, address: mac};
			debugLog('LUNA_BLEGATT', param, 'Call connect API');

			if (connectSubscription.get(mac)) {
				debugLog('LUNA_BLEGATT', {}, 'Cancel connect API with mac:', mac);
				connectSubscription.get(mac).cancel();
				connectSubscription.delete(mac);
			}

			const lscall = services.connect({
				parameters: param,
				onSuccess: res => {
					debugLog('LUNA_BLEGATT', res, 'Success connect API');

					if (typeof res.event !== 'undefined') {
						switch (res.event) {
							case 'onConnectionStateChange':
								if (res.values) {
									dispatch(setDeviceInfo(res.values));
								}
								break;
							case 'onServicesDiscovered':
								if (res.values) {
									dispatch(setDeviceInfo(res.values));
								}
								break;
							case 'onCharacteristicChanged':
								if (res.values) {
									dispatch(setCharacteristicChanged(res.values));
								}
								break;
							case 'onCharacteristicRead':
								if (res.values) {
									dispatch(setCharacteristicRead(res.values));
								}
								break;
							case 'onCharacteristicWrite':
								break;
							case 'onDescriptorRead':
								if (res.values) {
									dispatch(setDescriptorRead(res.values));
								}
								break;
							case 'onDescriptorWrite':
								break;
							default:
								break;
						}
					}
				},
				onFailure: err => {
					debugLog('LUNA_BLEGATT', err, 'Error connect API');
					dispatch(
						setAlert({
							title: 'Error connect API',
							text: err.errorText,
							type: 'fullscreen',
							open: true
						})
					);
				}
			});

			connectSubscription.set(mac, lscall);
		},
		[dispatch]
	);
};

export const useDisconnect = () => {
	const dispatch = useDispatch();

	return useCallback(
		mac => {
			const param = {address: mac};
			debugLog('LUNA_BLEGATT', param, 'Call disconnect API');

			services
				.disconnect(param)
				.then(res => {
					debugLog('LUNA_BLEGATT', res, 'Success disconnect API');
				})
				.catch(err => {
					debugLog('LUNA_BLEGATT', err, 'Error disconnect API');
					dispatch(
						setAlert({
							title: 'Error disconnect API',
							text: err.errorText,
							type: 'fullscreen',
							open: true
						})
					);
				});
		},
		[dispatch]
	);
};

export const useDiscoverServices = () => {
	const dispatch = useDispatch();

	return useCallback(
		mac => {
			const param = {address: mac};
			debugLog('LUNA_BLEGATT', param, 'Call discoverServices API');

			services
				.discoverServices(param)
				.then(res => {
					debugLog('LUNA_BLEGATT', res, 'Success discoverServices API');
					if (res.returnValue) {
						dispatch(
							setAlert({
								title: 'discoverServices API',
								text: 'discoverServices done',
								type: 'overlay',
								open: true
							})
						);
					}
				})
				.catch(err => {
					debugLog('LUNA_BLEGATT', err, 'Error discoverServices API');
					dispatch(
						setAlert({
							title: 'Error discoverServices API',
							text: err.errorText,
							type: 'fullscreen',
							open: true
						})
					);
				});
		},
		[dispatch]
	);
};

export const useGetServices = () => {
	const dispatch = useDispatch();

	return useCallback(
		mac => {
			const param = {address: mac};
			debugLog('LUNA_BLEGATT', param, 'Call getServices API');

			services
				.getServices(param)
				.then(res => {
					debugLog('LUNA_BLEGATT', res, 'Success getServices API');
				})
				.catch(err => {
					debugLog('LUNA_BLEGATT', err, 'Error getServices API');
					dispatch(
						setAlert({
							title: 'Error getServices API',
							text: err.errorText,
							type: 'fullscreen',
							open: true
						})
					);
				});
		},
		[dispatch]
	);
};

export const useSetCharacteristicNotification = () => {
	const dispatch = useDispatch();

	return useCallback(
		(mac, char, service, enable) => {
			const param = {
				address: mac,
				characteristic: char,
				service: service,
				enable: enable
			};

			debugLog('LUNA_BLEGATT', param, 'Call setCharacteristicNotification API');

			services
				.setCharacteristicNotification(param)
				.then(res => {
					debugLog(
						'LUNA_BLEGATT',
						res,
						'Success setCharacteristicNotification API'
					);
				})
				.catch(err => {
					debugLog(
						'LUNA_BLEGATT',
						err,
						'Error setCharacteristicNotification API'
					);
					dispatch(
						setAlert({
							title: 'Error setCharacteristicNotification API',
							text: err.errorText,
							type: 'fullscreen',
							open: true
						})
					);
				});
		},
		[dispatch]
	);
};

export const useReadCharacteristic = () => {
	const dispatch = useDispatch();

	return useCallback(
		(mac, char, service) => {
			const param = {
				address: mac,
				characteristic: char,
				service: service
			};
			debugLog('LUNA_BLEGATT', param, 'Call readCharacteristic API');

			services
				.readCharacteristic(param)
				.then(res => {
					debugLog('LUNA_BLEGATT', res, 'Success readCharacteristic API');
				})
				.catch(err => {
					debugLog('LUNA_BLEGATT', err, 'Error readCharacteristic API');
					dispatch(
						setAlert({
							title: 'Error readCharacteristic API',
							text: err.errorText,
							type: 'fullscreen',
							open: true
						})
					);
				});
		},
		[dispatch]
	);
};

export const useWriteCharacteristic = () => {
	const dispatch = useDispatch();

	return useCallback(
		(mac, char, service, value) => {
			const param = {
				address: mac,
				characteristic: char,
				service: service,
				value: value
			};
			debugLog('LUNA_BLEGATT', param, 'Call writeCharacteristic API');

			services
				.writeCharacteristic(param)
				.then(res => {
					debugLog('LUNA_BLEGATT', res, 'Success writeCharacteristic API');
				})
				.catch(err => {
					debugLog('LUNA_BLEGATT', err, 'Error writeCharacteristic API');
					dispatch(
						setAlert({
							title: 'Error writeCharacteristic API',
							text: err.errorText,
							type: 'fullscreen',
							open: true
						})
					);
				});
		},
		[dispatch]
	);
};

export const useReadDescriptor = () => {
	const dispatch = useDispatch();

	return useCallback(
		(mac, char, service, descriptor) => {
			const param = {
				address: mac,
				characteristic: char,
				service: service,
				descriptor: descriptor
			};
			debugLog('LUNA_BLEGATT', param, 'Call readDescriptor API');

			services
				.readDescriptor(param)
				.then(res => {
					debugLog('LUNA_BLEGATT', res, 'Success readDescriptor API');
				})
				.catch(err => {
					debugLog('LUNA_BLEGATT', err, 'Error readDescriptor API');
					dispatch(
						setAlert({
							title: 'Error readDescriptor API',
							text: err.errorText,
							type: 'fullscreen',
							open: true
						})
					);
				});
		},
		[dispatch]
	);
};

export const useWriteDescriptor = () => {
	const dispatch = useDispatch();

	return useCallback(
		(mac, char, service, descriptor, value) => {
			const param = {
				address: mac,
				characteristic: char,
				service: service,
				descriptor: descriptor,
				value: value
			};

			debugLog('LUNA_BLEGATT', param, 'Call writeDescriptor API');

			services
				.writeDescriptor(param)
				.then(res => {
					debugLog('LUNA_BLEGATT', res, 'Success writeDescriptor API');
				})
				.catch(err => {
					debugLog('LUNA_BLEGATT', err, 'Error writeDescriptor API');
					dispatch(
						setAlert({
							title: 'Error writeDescriptor API',
							text: err.errorText,
							type: 'fullscreen',
							open: true
						})
					);
				});
		},
		[dispatch]
	);
};

export const useCloseAlert = () => {
	const alert = useSelector(state => state.blegatt.alert);
	const dispatch = useDispatch();
	const closeAlert = useCallback(() => {
		dispatch(
			setAlert({
				title: '',
				text: '',
				type: 'fullscreen',
				open: false
			})
		);
	}, [dispatch]);

	return [alert, closeAlert];
};
