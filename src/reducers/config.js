import {createSlice} from '@reduxjs/toolkit';

const {actions, reducer} = createSlice({
	name: 'config',
	initialState: {type: ''},
	reducers: {
		setType: (state, action) => {
			state.type = action.payload;
		}
	}
});

export const {setType} = actions;
export default reducer;
