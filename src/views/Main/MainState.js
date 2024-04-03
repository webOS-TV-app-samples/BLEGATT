// This is bundle of states of Main.js

import {useCallback, useMemo, useState} from 'react';
import {useDispatch} from 'react-redux';
import {pushPanel} from '../../reducers/panel';

export const useText = () => {
	return useMemo(() => {
		return 'ABC';
	}, []);
};

export const usePopup = () => {
	const [isPopupOpen, openPopup] = useState(false);

	const handlePopupOpen = useCallback(() => {
		openPopup(true);
	}, []);

	const handlePopupClose = useCallback(() => {
		openPopup(false);
	}, []);

	return {isPopupOpen, handlePopupOpen, handlePopupClose};
};

export const useNext = () => {
	const dispatch = useDispatch();

	return useCallback(() => {
		dispatch(pushPanel('sub'));
	}, [dispatch]);
};
