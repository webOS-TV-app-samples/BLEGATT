import {useCallback, useEffect} from 'react';
import {useSelector} from 'react-redux';

import {Header, Panel} from '@enact/sandstone/Panels';
import {TabLayout, Tab} from '@enact/sandstone/TabLayout';
import Alert from '@enact/sandstone/Alert';
import Button from '@enact/sandstone/Button';

import Scan from '../../components/Scan';
import Services from '../../components/Services/Services';

import {useCloseAlert} from '../../hooks/blegatt';
import {closeApp} from '../../libs/utils';

import {off, on} from '@enact/core/dispatcher';

const Main = props => {
	const status = useSelector(state => state.blegatt.status);
	const devices = useSelector(state => state.blegatt.devices);
	const [alert, closeAlert] = useCloseAlert();


	const handleVisibilityChanged = useCallback((ev) => {
		if (ev.type === 'visibilitychange') {
			closeApp();
		}
	}, []);

	useEffect(() => {
		on ('visibilitychange', handleVisibilityChanged, document);
		return () => {
			off('visibilitychange', handleVisibilityChanged, document);
		};
	}, [handleVisibilityChanged]);

	const onClickAlertButton = useCallback(() => {
		console.log('enter onClickAlertButton');
		closeAlert();
	}, [closeAlert]);

	return (
		<Panel {...props}>
			<Header title={'BLE Test App. status? ' + status} />
			<TabLayout orientation="horizontal">
				<Tab title="Scan">
					<Scan />
				</Tab>
				{devices.map(e =>
					e.connected ? (
						<Tab title={e.address} key={'tab' + e.address}>
							<Services device={e} />
						</Tab>
					) : null
				)}
			</TabLayout>
			<Alert open={alert.open} type={alert.type} title={alert.title}>
				{alert.text}

				<buttons>
					<Button onClick={onClickAlertButton}>OK</Button>
				</buttons>
			</Alert>
		</Panel>
	);
};

export default Main;
