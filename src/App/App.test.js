jest.mock('../libs/log');

import '@testing-library/jest-dom';
import {defineFeature, loadFeature} from 'jest-cucumber';
import {act, fireEvent, screen, waitFor} from '@testing-library/react';

import {debugLog} from '../libs/log';
import launch, {launchApp, pushBackButton} from '../libs/testutils';

const feature = loadFeature('./src/App/App.feature');

beforeEach(() => {
	window.webOSSystem = {
		PmLogString: jest.fn(),
		close: jest.fn(),
		platformBack: jest.fn(),
		setWindowOrientation: jest.fn()
	};
});

afterEach(() => {
	debugLog.mockRestore();
});

defineFeature(feature, run => {
	run('Launch the app', ({given, then}) => {
		launchApp(given);
		then('App is displayed well.', () => {
			const item = screen.queryByText(/BLE/i);
			expect(item).not.toBeNull();
		});
	});

	run('Close the app', ({given, when, then}) => {
		launchApp(given);
		when('User clicks X button.', async () => {
			const x = screen.queryByLabelText(/exit app/i);
			fireEvent.click(x);
		});
		then('The app is closed.', () => {
			expect(window.webOSSystem.close).toBeCalled();
		});
	});

	run('Close the app by back key', ({given, when, then}) => {
		launchApp(given);
		pushBackButton(when);
		then('The app is closed.', () => {
			expect(window.webOSSystem.platformBack).toBeCalled();
		});
	});
});

describe('The app handles document events.', () => {
	test("Doesn't update launch parameters when parsing wrong value.", async () => {
		window.webOSSystem.launchParams = '{a:1}';
		const {store} = await launch();
		expect(store.getState().general.launchParams).toEqual({});
	});

	test('Parses launch parameters when relaunched.', async () => {
		window.webOSSystem.launchParams = '{"a":1}';
		const {store} = await launch();
		expect(store.getState().general.launchParams).toEqual({a: 1});
		window.webOSSystem.launchParams = '{"a":2}';
		/* eslint-disable-next-line no-undef */
		const event = new CustomEvent('webOSRelaunch');
		await act(async () => {
			await document.dispatchEvent(event);
		});
		await waitFor(() => {
			expect(store.getState().general.launchParams).toEqual({a: 2});
		});
	});

	test('The app is reloaded when locale has changed.', async () => {
		const {location} = window;
		delete window.location;
		window.location = {
			href: 'http://localhost/',
			replace: jest.fn()
		};
		await launch();
		/* eslint-disable-next-line no-undef */
		const event = new CustomEvent('webOSLocaleChange');
		await act(async () => {
			await document.dispatchEvent(event);
		});
		expect(window.location.replace).toBeCalledWith(
			'http://localhost/index.html'
		);
		window.location = location;
	});

	test('The app handles high contrast change event.', async () => {
		window.webOSSystem.highContrast = 'on';
		await launch();
		let root = screen.queryByTestId('root');
		expect(root).toHaveClass('highContrast');
		window.webOSSystem.highContrast = 'off';
		/* eslint-disable-next-line no-undef */
		const event = new CustomEvent('webOSHighContrastChange');
		await act(async () => {
			await document.dispatchEvent(event);
		});
		root = screen.queryByTestId('root');
		expect(root).not.toHaveClass('highContrast');
	});

	test('The app handles screen orientation change.', async () => {
		await launch();
		/* eslint-disable-next-line no-undef */
		const event = new CustomEvent('screenOrientationChange', {
			detail: {
				screenOrientation: 'portrait'
			}
		});
		await act(async () => {
			await document.dispatchEvent(event);
		});
		expect(window.webOSSystem.setWindowOrientation).toBeCalledWith('portrait');
	});

	test('The app handles visibility change.', async () => {
		const {store} = await launch();
		const before = store.getState().general.isForeground;
		Object.defineProperty(window.document, 'hidden', {
			writable: true,
			value: true
		});
		document.dispatchEvent(new window.Event('visibilitychange'));
		const after = store.getState().general.isForeground;
		expect(before).not.toBe(after);
	});
});
