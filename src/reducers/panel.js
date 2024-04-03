import {createSlice} from '@reduxjs/toolkit';

const {actions, reducer} = createSlice({
	name: 'panel',
	initialState: {
		panels: ['main'],
		index: 0
	},
	reducers: {
		popPanel: state => {
			if (state.index > 0) {
				state.index -= 1;
				state.panels.pop();
			}
		},
		pushPanel: (state, action) => {
			state.index += 1;
			state.panels.push(action.payload);
		}
	}
});

export const {popPanel, pushPanel} = actions;
export default reducer;
