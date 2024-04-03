import {memo, useCallback, useEffect, useState} from 'react';
import {useSelector} from 'react-redux';

import BodyText from '@enact/sandstone/BodyText';
import Button from '@enact/sandstone/Button';
import CheckboxItem from '@enact/sandstone/CheckboxItem';
import {InputField} from '@enact/sandstone/Input';
import Scroller from '@enact/sandstone/Scroller';
import {
	useConnect,
	useDevices,
	useDisconnect,
	useStartScan,
	useStopScan,
	usePair,
	useUnpair
} from '../../hooks/blegatt';

import css from './Scan.module.less';

const Scan = () => {
	const status = useSelector(state => state.blegatt.status);
	const [enableSeviceUuidSearch, setEnableSeviceUuidSearch] = useState(false);
	const [enableFilteredByName, setEnableFilteredByName] = useState(true);
	const [serviceUuid, setServiceUuid] = useState(
		'0000fff1-0000-1000-8000-00805f9b34fb'
	);
	const [position, setPosition] = useState(0);
	const startScan = useStartScan();
	const stopScan = useStopScan();
	const connect = useConnect();
	const disconnect = useDisconnect();
	const [devices, hideDevices] = useDevices();
	const pair = usePair();
	const unpair = useUnpair();

	useEffect(() => {
		const inputElement = document.getElementsByClassName(
			'enact_sandstone_Input_InputField_input'
		);

		if (inputElement.length !== 0) {
			console.log('set position:', position, serviceUuid[position]);
			inputElement[0].selectionStart = position;
			inputElement[0].selectionEnd = position;
		}
	}, [position, serviceUuid]);

	const onToggleDeviceButton = useCallback(
		e => {
			let mac = null;
			if (e.currentTarget && e.currentTarget.getAttribute('option-id')) {
				mac = e.currentTarget.getAttribute('option-id');
			}

			if (mac) {
				const i = devices.findIndex(t => t.address === mac);

				if (
					typeof devices[i] !== 'undefined' &&
					typeof devices[i].connected !== 'undefined' &&
					devices[i].connected
				) {
					disconnect(mac);
				} else {
					if (status === 'scan') {
						stopScan();
					}
					connect(mac);
				}
			}
		},
		[connect, disconnect, devices, status, stopScan]
	);

	const onClickScanButton = useCallback(() => {
		console.log('enter onClickScanButton');
		if (status === 'scan') {
			stopScan();
		} else if (enableSeviceUuidSearch) {
			hideDevices();
			startScan(enableFilteredByName, serviceUuid);
		} else {
			hideDevices();
			startScan(enableFilteredByName);
		}
	}, [
		enableFilteredByName,
		enableSeviceUuidSearch,
		serviceUuid,
		hideDevices,
		startScan,
		stopScan,
		status
	]);

	const onClickEnableFilterByName = useCallback(
		e => {
			setEnableFilteredByName(e.selected);
		},
		[setEnableFilteredByName]
	);

	const onClickEnableUuidSearch = useCallback(
		e => {
			setEnableSeviceUuidSearch(e.selected);
		},
		[setEnableSeviceUuidSearch]
	);

	const onBeforeChangeInput = useCallback(
		e => {
			let changePosition = 0;
			const inputElement = document.getElementsByClassName(
				'enact_sandstone_Input_InputField_input'
			);

			if (inputElement.length !== 0) {
				changePosition = inputElement[0].selectionStart;
			}

			let inputStr = e.value;
			if (inputStr.length > 36) {
				console.log('do not change input: length > 36');
				return;
			}

			if (inputStr.length < serviceUuid.length) {
				let i = changePosition;

				if (serviceUuid[i] === '-') {
					// when backspace button is pressed at the '-', remove it.
					inputStr = inputStr.substring(0, i - 1) + inputStr.substring(i);
				}
			}

			const hexStr = inputStr.replaceAll('-', '');
			const hexRegex = /^[a-fA-F0-9]*$/;
			if (hexRegex.test(hexStr) === false) {
				console.log('do not change input: invalid hex');
				return;
			}

			// modify inputStr for UUID format
			inputStr = '';
			for (let j in hexStr) {
				if (j === '8' || j === '12' || j === '16' || j === '20') {
					inputStr += '-';
				}
				inputStr += hexStr[j];
			}

			let diff = 0;
			if (inputStr.length < serviceUuid.length) {
				// delete
				if (serviceUuid[changePosition] === '-') {
					diff -= 1;
				}
			} else if (inputStr.length > serviceUuid.length) {
				// append case.
				if (inputStr[changePosition - 1] === '-') {
					diff += 1;
				}
			}

			setServiceUuid(inputStr.toLowerCase());
			setPosition(changePosition + diff);
		},
		[serviceUuid, setServiceUuid, setPosition]
	);

	const onClickUnpairButton = useCallback(
		e => {
			let mac = null;
			if (e.currentTarget && e.currentTarget.getAttribute('option-id')) {
				mac = e.currentTarget.getAttribute('option-id');
			}

			if (mac) {
				unpair(mac);
			}
		},
		[unpair]
	);

	const onClickPairButton = useCallback(
		e => {
			let mac = null;
			if (e.currentTarget && e.currentTarget.getAttribute('option-id')) {
				mac = e.currentTarget.getAttribute('option-id');
			}

			if (mac) {
				pair(mac);
			}
		},
		[pair]
	);

	return (
		<div className={css.layout}>
			<div className={css.scan}>
				<Button onClick={onClickScanButton} size="small">
					{status === 'scan' ? 'Stop Scan' : 'Scan'}
				</Button>
				<CheckboxItem
					className={css.serviceFilteredByNameCheckbox}
					onToggle={onClickEnableFilterByName}
					disabled={status === 'scan'}
					selected={enableFilteredByName}
				>
					Filtered by name
				</CheckboxItem>
				<CheckboxItem
					className={css.serviceUuidCheckbox}
					onToggle={onClickEnableUuidSearch}
					disabled={status === 'scan'}
				>
					With Service UUID
				</CheckboxItem>
				<InputField
					className={css.serviceUuidInput}
					onBeforeChange={onBeforeChangeInput}
					size="small"
					type="text"
					disabled={status === 'scan' || !enableSeviceUuidSearch}
					value={serviceUuid}
				/>
			</div>
			<div className={css.scanLayout}>
				<BodyText centered className={css.bodyTextMargin}>
					Scan List
				</BodyText>
				<Scroller className={css.scrollerHeight}>
					{devices.map(
						({address, name, connected, connecting, rssi, searched, paired}) =>
							searched ? (
								<div key={address + 'scan'} className={css.deviceLayout}>
									<CheckboxItem
										icon="bluetooth"
										option-id={address}
										onClick={onToggleDeviceButton}
										selected={connected}
										disabled={connecting}
										className={css.deviceCheckboxItem}
									>
										{address}, {name}, rssi: {rssi}
									</CheckboxItem>
									{paired ? (
										<Button
											size="small"
											option-id={address}
											onClick={onClickUnpairButton}
										>
											Unpair
										</Button>
									) : (
										<Button
											size="small"
											option-id={address}
											onClick={onClickPairButton}
										>
											Pair
										</Button>
									)}
								</div>
							) : null
					)}
				</Scroller>
			</div>
			<div className={css.pairedLayout}>
				<BodyText centered className={css.bodyTextMargin}>
					Paired List
				</BodyText>
				<Scroller className={css.scrollerHeight}>
					{devices.map(({address, name, connected, connecting, rssi, paired}) =>
						paired ? (
							<div key={address + 'paired'} className={css.deviceLayout}>
								<CheckboxItem
									icon="bluetooth"
									option-id={address}
									onClick={onToggleDeviceButton}
									selected={connected}
									disabled={connecting}
									className={css.deviceCheckboxItem}
								>
									{address}, {name}, rssi: {rssi}
								</CheckboxItem>
								<Button
									size="small"
									option-id={address}
									onClick={onClickUnpairButton}
								>
									Unpair
								</Button>
							</div>
						) : null
					)}
				</Scroller>
			</div>
		</div>
	);
};

export default memo(Scan);
