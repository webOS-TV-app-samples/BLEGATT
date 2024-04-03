import {createSlice} from '@reduxjs/toolkit';

const {actions, reducer} = createSlice({
	name: 'blegatt',
	initialState: {
		enable: false,
		status: 'init', // init, enable, disable, scan,
		devices: [],
		alert: {
			title: '',
			text: '',
			type: 'fullscreen',
			open: false
		}
	},
	reducers: {
		setEnable: (state, action) => {
			state.enable = action.payload;
		},
		setStatus: (state, action) => {
			if (action.payload === 'scan') {
				state.status = action.payload;
			} else {
				state.status = state.enable ? 'enabled' : 'disabled';
			}

			console.log('test... set status', state.status);
		},
		setHideDevices: state => {
			state.devices = state.devices.filter(device => device.searched);
			state.devices.forEach(device => {
				device.searched = false;
			});
		},
		setDevices: (state, action) => {
			if (action.payload.address) {
				const i = state.devices.findIndex(
					t => t.address === action.payload.address
				);
				if (i > -1) {
					state.devices[i] = {
						...state.devices[i],
						...action.payload,
						searched: true
					};
				} else {
					state.devices.push({
						...action.payload,
						connected: false,
						paired: false,
						searched: true
					});
				}
			} else {
				console.log('error. address', action.payload.address);
			}
		},
		setPairedDevice: (state, action) => {
			for (const pairedDevice of action.payload) {
				const i = state.devices.findIndex(
					t => t.address === pairedDevice.address
				);

				if (i > -1) {
					// paired address 가 포함된 기존 list 의 device 업데이트
					state.devices[i] = {
						...state.devices[i],
						...pairedDevice,
						paired: true
					};
				} else {
					// paired address 가 기존 list 에 없으면 신규 device 추가
					state.devices.push({
						...pairedDevice,
						connected: false,
						paired: true,
						searched: false
					});
				}
			}

			for (const device of state.devices) {
				// paired address 가 기존 list 의 device 와 일치하지 않으면 paired:false
				const i = action.payload.findIndex(t => t.address === device.address);

				if (i <= -1) {
					device.paired = false;
				}
			}
		},
		setDeviceInfo: (state, action) => {
			if (action.payload.address) {
				const i = state.devices.findIndex(
					device => device.address === action.payload.address
				);
				if (i > -1) {
					state.devices[i] = {...state.devices[i], ...action.payload};
				} else {
					console.log('error. cannot find address', action.payload.address);
				}
			} else {
				console.log('error. address', action.payload.address);
			}
		},
		setCharacteristicChanged: (state, action) => {
			if (action.payload.address) {
				const i = state.devices.findIndex(
					device => device.address === action.payload.address
				);
				if (i > -1) {
					const {
						instanceId,
						characteristic: characteristicUuid,
						value
					} = action.payload.changed;
					let found = false;
					let k = -1;

					const j = state.devices[i].services.findIndex(service => {
						k = service.characteristics.findIndex(
							characteristicObj =>
								characteristicObj.characteristic === characteristicUuid
						);
						if (k > -1) {
							return true;
						}
					});

					if (k > -1) {
						state.devices[i].services[j].characteristics[k].instanceId =
							instanceId;
						state.devices[i].services[j].characteristics[k].value = value;
						found = true;
						console.log(j, k, state.devices[i].services[j], value);
					}

					if (!found) {
						console.log(
							'error. cannot find characteristic',
							characteristicUuid
						);
					}
				} else {
					console.log('error. cannot find address', action.payload.address);
				}
			} else {
				console.log('error. address', action.payload.address);
			}
		},
		setCharacteristicRead: (state, action) => {
			if (action.payload.address) {
				const i = state.devices.findIndex(
					device => device.address === action.payload.address
				);
				if (i > -1) {
					const {service: serviceUuid, values} = action.payload;

					const j = state.devices[i].services.findIndex(
						service => service.service === serviceUuid
					);
					if (j > -1) {
						state.devices[i].services[j].characteristics = values;
					} else {
						console.log('error. cannot find service', serviceUuid);
					}
				} else {
					console.log('error. cannot find address', action.payload.address);
				}
			} else {
				console.log('error. address', action.payload.address);
			}
		},
		setDescriptorRead: (state, action) => {
			if (action.payload.address) {
				const i = state.devices.findIndex(
					device => device.address === action.payload.address
				);
				if (i > -1) {
					const {
						service: serviceUuid,
						characteristic: characteristicUuid,
						values
					} = action.payload;

					const j = state.devices[i].services.findIndex(
						service => service.service === serviceUuid
					);
					if (j > -1) {
						const k = state.devices[i].services[j].characteristics.findIndex(
							characteristic => {
								console.log(
									'Test',
									characteristic,
									characteristic.characteristic === characteristicUuid
								);
								return characteristic.characteristic === characteristicUuid;
							}
						);

						if (k > -1) {
							state.devices[i].services[j].characteristics[k].descriptors =
								values;
						} else {
							console.log(
								'error. cannot find characteristic',
								characteristicUuid
							);
						}
					} else {
						console.log('error. cannot find service', serviceUuid);
					}
				} else {
					console.log('error. cannot find address', action.payload.address);
				}
			} else {
				console.log('error. address', action.payload.address);
			}
		},
		setAlert: (state, action) => {
			state.alert = {
				title: action.payload.title,
				text: action.payload.text,
				type: action.payload.type,
				open: action.payload.open
			};
		}
	}
});

export const {
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
} = actions;
export default reducer;
