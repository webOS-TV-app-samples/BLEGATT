import {memo, useCallback, useState, useRef} from 'react';
import PropTypes from 'prop-types';

import Button from '@enact/sandstone/Button';
import BodyText from '@enact/sandstone/BodyText';
import Input from '@enact/sandstone/Input';
import Scroller from '@enact/sandstone/Scroller';

import {
	useDisconnect,
	useDiscoverServices,
	useGetServices,
	useSetCharacteristicNotification,
	useReadCharacteristic,
	useWriteCharacteristic,
	useReadDescriptor,
	useWriteDescriptor
} from '../../hooks/blegatt';

import css from './Services.module.less';

const Descriptor = ({mac, serviceUuid, characteristicUuid, descriptor}) => {
	const readDescriptor = useReadDescriptor();
	const writeDescriptor = useWriteDescriptor();
	const {instanceId, value, descriptor: descriptorUuid} = descriptor;

	const onClickRead = useCallback(() => {
		console.log('enter onClickRead', mac, characteristicUuid, serviceUuid);
		readDescriptor(mac, characteristicUuid, serviceUuid, descriptorUuid);
	}, [characteristicUuid, descriptorUuid, mac, serviceUuid, readDescriptor]);

	const onCompleteWrite = useCallback(
		e => {
			console.log(
				'enter onCompleteWrite',
				mac,
				characteristicUuid,
				serviceUuid,
				e.value
			);
			const bytes = [];
			const inputs = e.value.split(/[ ,]+/);
			inputs.forEach(input => {
				const num = parseInt(input);
				if (!isNaN(num)) {
					bytes.push(num);
				}
			});
			e.value = '';

			console.log('value.bytes', bytes);
			writeDescriptor(mac, characteristicUuid, serviceUuid, descriptorUuid, {
				bytes: bytes
			});
		},
		[characteristicUuid, descriptorUuid, mac, serviceUuid, writeDescriptor]
	);

	return (
		<div key={descriptorUuid} className={css.descriptor}>
			<div style={{display: 'flex'}}>
				<BodyText>
					Descriptor UUID: {descriptorUuid}, instanceID: {instanceId}
				</BodyText>
				<Button onClick={onClickRead} size="small">
					R
				</Button>
				<Input
					onComplete={onCompleteWrite}
					placeholder="W"
					popupType="overlay"
					size="small"
				/>
			</div>
			{value ? <BodyText>Value: {JSON.stringify(value)}</BodyText> : null}
		</div>
	);
};

Descriptor.propTypes = {
	characteristicUuid: PropTypes.string,
	descriptor: PropTypes.shape({
		descriptor: PropTypes.string,
		instanceId: PropTypes.string,
		permissions: PropTypes.object,
		value: PropTypes.object
	}),
	mac: PropTypes.string,
	serviceUuid: PropTypes.string
};

const Characteristic = ({mac, serviceUuid, characteristic}) => {
	const [detail, setDetail] = useState(true);
	const setCharacteristicNotification = useSetCharacteristicNotification();
	const readCharacteristic = useReadCharacteristic();
	const writeCharacteristic = useWriteCharacteristic();
	const notifyEnable = useRef(false);
	const {
		instanceId,
		characteristic: charUuid,
		properties,
		value,
		descriptors
	} = characteristic;

	const onClickCharacteristic = useCallback(() => {
		setDetail(!detail);
	}, [detail, setDetail]);

	const onClickRead = useCallback(() => {
		console.log('enter onClickRead', mac, charUuid, serviceUuid);
		readCharacteristic(mac, charUuid, serviceUuid);
	}, [charUuid, mac, serviceUuid, readCharacteristic]);

	const onCompleteWrite = useCallback(
		e => {
			console.log('enter onCompleteWrite', mac, charUuid, serviceUuid, e.value);
			const bytes = [];
			const inputs = e.value.split(/[ ,]+/);
			inputs.forEach(input => {
				const num = parseInt(input);
				if (!isNaN(num)) {
					bytes.push(num);
				}
			});
			e.value = '';

			console.log('value.bytes', bytes);
			writeCharacteristic(mac, charUuid, serviceUuid, {bytes: bytes});
		},
		[charUuid, mac, serviceUuid, writeCharacteristic]
	);

	const onClickNotify = useCallback(() => {
		console.log('enter onClickNotify', mac, charUuid, serviceUuid);
		notifyEnable.current = !notifyEnable.current;
		setCharacteristicNotification(
			mac,
			charUuid,
			serviceUuid,
			notifyEnable.current
		);
	}, [charUuid, mac, serviceUuid, notifyEnable, setCharacteristicNotification]);

	return (
		<div className={css.characteristic}>
			<div style={{display: 'flex'}}>
				<BodyText onClick={onClickCharacteristic}>
					Characteristic UUID: {charUuid}, instanceID: {instanceId}
				</BodyText>
				{properties && properties.read ? (
					<Button onClick={onClickRead} size="small">
						R
					</Button>
				) : null}
				{properties && properties.write ? (
					<Input
						onComplete={onCompleteWrite}
						placeholder="W"
						popupType="overlay"
						size="small"
					/>
				) : null}
				{properties && properties.notify ? (
					<Button onClick={onClickNotify} size="small">
						N
					</Button>
				) : null}
			</div>
			{value ? <BodyText>Value: {JSON.stringify(value)}</BodyText> : null}
			{detail && descriptors && descriptors.length !== 0
				? descriptors.map(descriptor => (
						<Descriptor
							key={descriptor.descriptor}
							mac={mac}
							serviceUuid={serviceUuid}
							characteristicUuid={charUuid}
							descriptor={descriptor}
						/>
				  ))
				: null}
		</div>
	);
};

Characteristic.propTypes = {
	characteristic: PropTypes.shape({
		characteristic: PropTypes.string,
		descriptors: PropTypes.array,
		instanceId: PropTypes.string,
		properties: PropTypes.object,
		value: PropTypes.object
	}),
	mac: PropTypes.string,
	serviceUuid: PropTypes.string
};

const Service = ({mac, service}) => {
	const [detail, setDetail] = useState(true);
	const {service: serviceUuid, type, characteristics} = service;
	console.log('enter', serviceUuid, detail);

	const onClickService = useCallback(() => {
		setDetail(!detail);
	}, [detail, setDetail]);

	return (
		<div className={css.services} key={serviceUuid}>
			<BodyText onClick={onClickService}>
				Service UUID: {serviceUuid}, type: {type}
			</BodyText>
			{detail && service && characteristics
				? characteristics.map(characteristic => (
						<Characteristic
							key={characteristic.instanceId}
							mac={mac}
							serviceUuid={service.service}
							characteristic={characteristic}
						/>
				  ))
				: null}
		</div>
	);
};

Service.propTypes = {
	mac: PropTypes.string,
	service: PropTypes.shape({
		characteristics: PropTypes.array,
		serviceUuid: PropTypes.string,
		type: PropTypes.string
	})
};

const Services = ({device}) => {
	const discoverServices = useDiscoverServices();
	const getServices = useGetServices();
	const disconnect = useDisconnect();
	const mac = device.address;

	const onClickDiconnectButton = useCallback(() => {
		disconnect(mac);
	}, [mac, disconnect]);

	const onClickDiscoverServicesButton = useCallback(() => {
		console.log('enter onClickDiscoverServicesButton', mac);

		if (mac) {
			discoverServices(mac);
		}
	}, [mac, discoverServices]);

	const onClickGetServicesButton = useCallback(() => {
		console.log('enter getServices', mac);

		if (mac) {
			getServices(mac);
		}
	}, [mac, getServices]);

	return (
		<Scroller>
			<Button onClick={onClickDiconnectButton} size="small">
				Disconnect
			</Button>
			<Button onClick={onClickDiscoverServicesButton} size="small">
				Discover Services
			</Button>
			<Button onClick={onClickGetServicesButton} size="small">
				Get Services
			</Button>

			{device.services
				? device.services.map(service => (
						<Service
							mac={device.address}
							service={service}
							key={service.service}
						/>
				  ))
				: null}
		</Scroller>
	);
};

Services.propTypes = {
	device: PropTypes.shape({
		adapterAddress: PropTypes.string,
		address: PropTypes.string,
		clientId: PropTypes.string,
		connected: PropTypes.bool,
		connecting: PropTypes.bool,
		name: PropTypes.string,
		status: PropTypes.string
	}),
	onRemove: PropTypes.func,
	onToggle: PropTypes.func
};

export default memo(Services);
