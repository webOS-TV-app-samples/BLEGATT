import {useCallback} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {add, toggle, remove, sleepTest} from '../reducers/userList';

export const useUsers = () => {
	const users = useSelector(state => state.userList.users);
	const dispatch = useDispatch();

	const addUser = useCallback(
		user => {
			console.log('1. before sleepTest'); // eslint-disable-line no-console
			dispatch(sleepTest(500));

			dispatch(add(user));
		},
		[dispatch]
	);

	const onToggle = useCallback(
		e => {
			let userId = parseInt(
				(e.currentTarget && e.currentTarget.getAttribute('option-id')) || ''
			);

			dispatch(toggle(userId));
		},
		[dispatch]
	);

	const onRemove = useCallback(
		e => {
			let userId = parseInt(
				(e.currentTarget && e.currentTarget.getAttribute('option-id')) || ''
			);

			dispatch(remove(userId));
		},
		[dispatch]
	);

	const countActiveUsers = useCallback(() => {
		// eslint-disable-next-line no-console
		console.log('활성 사용자 수를 세는중...');
		return users.filter(user => user.active).length;
	}, [users]);

	return [users, addUser, onToggle, onRemove, countActiveUsers];
};
