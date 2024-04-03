import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';

const sleep = n => new Promise(resolve => setTimeout(resolve, n));

// see https://redux-toolkit.js.org/api/createAsyncThunk
export const sleepTest = createAsyncThunk(
	'users/sleepTest',
	async (ms, thunkAPI) => {
		console.log('2. enter sleepTest', thunkAPI); // eslint-disable-line no-console

		await sleep(ms);

		console.log('3. finish sleepTest'); // eslint-disable-line no-console
		return ms + ' sleep done';
	}
);

// see https://redux-toolkit.js.org/api/createslice
const {actions, reducer} = createSlice({
	name: 'userList',
	initialState: {
		users: [
			{
				id: 1,
				name: 'velopert',
				email: 'public.velopert@gmail.com',
				active: true
			},
			{
				id: 2,
				name: 'tester',
				email: 'tester@example.com',
				active: false
			},
			{
				id: 3,
				name: 'liz',
				email: 'liz@example.com',
				active: false
			},
			{
				id: 4,
				name: 'abc',
				email: 'abc@example.com',
				active: false
			},
			{
				id: 5,
				name: 'wyz',
				email: 'wyz@example.com',
				active: false
			}
		]
	},
	reducers: {
		add: (state, action) => {
			const user = action.payload;
			state.users = state.users.concat(user);
		},
		toggle: (state, action) => {
			const id = action.payload;
			state.users = state.users.map(user =>
				user.id === id ? {...user, active: !user.active} : user
			);
		},
		remove: (state, action) => {
			const id = action.payload;
			state.users = state.users.filter(user => user.id !== id);
		}
	},
	extraReducers: builder => {
		// Add reducers for additional action types here, and handle loading state as needed
		builder.addCase(sleepTest.fulfilled, (state, action) => {
			// Add user to the state array
			console.log('4. after sleepTest', action.payload); // eslint-disable-line no-console
		});
	}
});

export const {add, toggle, remove} = actions;
export default reducer;
